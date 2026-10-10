const { pool } = require('../config/db');

/**
 * Smart Supplier Recommendation Engine Service
 * Calculates multi-factor weighted scoring for RFQ quotations dynamically from MySQL database.
 */

const getRecommendationWeights = async () => {
  try {
    const [rows] = await pool.query('SELECT txt_Criterion_Key, num_Weight_Percent FROM tbl_recommendation_weight');
    const weights = {
      price: 30.0,
      delivery: 20.0,
      rating: 15.0,
      stock: 15.0,
      moq: 10.0,
      location: 5.0,
      quality: 5.0
    };

    if (rows && rows.length > 0) {
      rows.forEach(r => {
        if (weights.hasOwnProperty(r.txt_Criterion_Key)) {
          weights[r.txt_Criterion_Key] = parseFloat(r.num_Weight_Percent);
        }
      });
    }

    return weights;
  } catch (error) {
    console.error('Error fetching recommendation weights, using defaults:', error.message);
    return {
      price: 30.0,
      delivery: 20.0,
      rating: 15.0,
      stock: 15.0,
      moq: 10.0,
      location: 5.0,
      quality: 5.0
    };
  }
};

const calculateRFQRecommendation = async (requirementId) => {
  // 1. Fetch RFQ details
  const [rfqs] = await pool.query(
    `SELECT r.*, p.txt_City as txt_Project_City, p.txt_Pincode as txt_Project_Pincode
     FROM tbl_material_requirement r
     JOIN tbl_project p ON r.int_Project_Id = p.int_Project_Id
     WHERE r.int_Requirement_Id = ?`,
    [requirementId]
  );

  if (!rfqs || rfqs.length === 0) {
    throw new Error('Material Requirement / RFQ not found');
  }

  const rfq = rfqs[0];

  // 2. Fetch total requested items count
  const [reqItems] = await pool.query(
    'SELECT int_Req_Item_Id, int_Product_Id, num_Quantity FROM tbl_requirement_item WHERE int_Requirement_Id = ?',
    [requirementId]
  );

  const totalReqItemsCount = reqItems.length || 1;

  // 3. Fetch all submitted quotations for this RFQ
  const [quotations] = await pool.query(
    `SELECT q.*, s.int_Supplier_Id, s.txt_Supplier_Name, s.txt_City as txt_Supplier_City, 
            s.txt_Pincode as txt_Supplier_Pincode, s.num_Delivery_Radius_KM,
            (SELECT COALESCE(AVG(num_Overall_Rating), 0) FROM tbl_supplier_review WHERE int_Supplier_Id = s.int_Supplier_Id) as num_Avg_Rating,
            (SELECT COUNT(*) FROM tbl_supplier_review WHERE int_Supplier_Id = s.int_Supplier_Id) as num_Review_Count
     FROM tbl_quotation q
     JOIN tbl_supplier s ON q.int_Supplier_Id = s.int_Supplier_Id
     WHERE q.int_Requirement_Id = ? AND q.txt_Status IN ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED')`,
    [requirementId]
  );

  if (!quotations || quotations.length === 0) {
    return {
      requirementId,
      hasQuotations: false,
      message: 'No submitted quotations available for calculation.',
      recommendations: []
    };
  }

  // 4. Fetch dynamic criterion weights
  const weights = await getRecommendationWeights();

  // Determine minimum quotation total price for price normalization
  const minPrice = Math.min(...quotations.map(q => parseFloat(q.num_Total_Amount)));

  // Calculate delivery deadline days from RFQ creation to required date
  const reqDate = new Date(rfq.dte_Required_Delivery_Date);
  const createdDate = new Date(rfq.dte_Created_Date);
  const targetDays = Math.max(1, Math.ceil((reqDate - createdDate) / (1000 * 60 * 60 * 24)));

  const scoredQuotations = [];

  for (const q of quotations) {
    const totalAmount = parseFloat(q.num_Total_Amount);
    const deliveryDays = parseInt(q.num_Delivery_Days, 10);
    const supplierRating = parseFloat(q.num_Avg_Rating);
    const reviewCount = parseInt(q.num_Review_Count, 10);

    // Fetch quotation items and check supplier stock/MOQ compliance
    const [quoItems] = await pool.query(
      `SELECT qi.*, sp.num_Current_Stock, sp.num_MOQ, sp.txt_Certification_Ref
       FROM tbl_quotation_item qi
       LEFT JOIN tbl_supplier_product sp ON (sp.int_Supplier_Id = ? AND sp.int_Product_Id = qi.int_Product_Id)
       WHERE qi.int_Quotation_Id = ?`,
      [q.int_Supplier_Id, q.int_Quotation_Id]
    );

    // --- A. Price Score (30%) ---
    // Formula: (minPrice / totalAmount) * 100
    const priceScore = totalAmount > 0 ? Math.min(100, (minPrice / totalAmount) * 100) : 0;

    // --- B. Delivery Score (20%) ---
    // Target days vs estimated delivery days
    let deliveryScore = 100;
    if (deliveryDays > targetDays) {
      const penalty = ((deliveryDays - targetDays) / targetDays) * 50;
      deliveryScore = Math.max(20, 100 - penalty);
    } else {
      const bonus = ((targetDays - deliveryDays) / targetDays) * 20;
      deliveryScore = Math.min(100, 80 + bonus);
    }

    // --- C. Supplier Rating Score (15%) ---
    // Rating out of 5 -> scale to 100. New suppliers without reviews get baseline neutral 70 score.
    const ratingScore = reviewCount > 0 ? (supplierRating / 5.0) * 100 : 70;

    // --- D. Stock Availability Score (15%) ---
    let stockScore = 100;
    let moqScore = 100;
    let qualityScore = 75; // Baseline quality score

    if (quoItems && quoItems.length > 0) {
      let fullStockCount = 0;
      let metMOQCount = 0;
      let certCount = 0;

      quoItems.forEach(item => {
        const qty = parseInt(item.num_Quantity, 10);
        const stock = item.num_Current_Stock !== null ? parseInt(item.num_Current_Stock, 10) : qty;
        const moq = item.num_MOQ !== null ? parseInt(item.num_MOQ, 10) : 1;

        if (stock >= qty) fullStockCount++;
        if (qty >= moq) metMOQCount++;
        if (item.txt_Certification_Ref && item.txt_Certification_Ref.trim() !== '') certCount++;
      });

      stockScore = (fullStockCount / quoItems.length) * 100;
      moqScore = (metMOQCount / quoItems.length) * 100;
      qualityScore = 70 + (certCount / quoItems.length) * 30;
    }

    // --- E. Location / Radius Score (5%) ---
    let locationScore = 80;
    if (q.txt_Supplier_City && rfq.txt_Project_City && q.txt_Supplier_City.toLowerCase() === rfq.txt_Project_City.toLowerCase()) {
      locationScore = 100;
    } else if (q.txt_Supplier_Pincode && rfq.txt_Project_Pincode && q.txt_Supplier_Pincode.substring(0, 3) === rfq.txt_Project_Pincode.substring(0, 3)) {
      locationScore = 90;
    }

    // --- F. Quotation Coverage ---
    const quotedItemsCount = quoItems.length;
    const coveragePercent = Math.min(100, (quotedItemsCount / totalReqItemsCount) * 100);

    // Weighted Score Total
    const rawTotalScore = (
      (priceScore * weights.price) +
      (deliveryScore * weights.delivery) +
      (ratingScore * weights.rating) +
      (stockScore * weights.stock) +
      (moqScore * weights.moq) +
      (locationScore * weights.location) +
      (qualityScore * weights.quality)
    ) / 100.0;

    // Apply Coverage multiplier so partial quotes are not unfairly ranked above complete quotes
    const finalScore = Math.round((rawTotalScore * (coveragePercent / 100.0)) * 10) / 10;

    // Build human-readable explainable reasons
    const reasons = [];
    if (totalAmount <= minPrice * 1.05) reasons.push('✓ Highly competitive pricing');
    if (deliveryDays <= targetDays) reasons.push(`✓ Fast delivery within ${deliveryDays} days`);
    if (reviewCount > 0 && supplierRating >= 4.0) reasons.push(`✓ Top-rated supplier (${supplierRating.toFixed(1)}/5.0 stars)`);
    if (stockScore === 100) reasons.push('✓ 100% stock available for all items');
    if (moqScore === 100) reasons.push('✓ Minimum Order Quantities satisfied');
    if (locationScore === 100) reasons.push(`✓ Local supplier in ${rfq.txt_Project_City}`);
    if (coveragePercent === 100) reasons.push('✓ Complete 100% RFQ item coverage');

    scoredQuotations.push({
      quotationId: q.int_Quotation_Id,
      quotationCode: q.txt_Quotation_Code,
      supplierId: q.int_Supplier_Id,
      supplierName: q.txt_Supplier_Name,
      totalAmount,
      deliveryDays,
      coveragePercent,
      overallScore: finalScore,
      scoreBreakdown: {
        priceScore: Math.round(priceScore * 10) / 10,
        deliveryScore: Math.round(deliveryScore * 10) / 10,
        ratingScore: Math.round(ratingScore * 10) / 10,
        stockScore: Math.round(stockScore * 10) / 10,
        moqScore: Math.round(moqScore * 10) / 10,
        locationScore: Math.round(locationScore * 10) / 10,
        qualityScore: Math.round(qualityScore * 10) / 10,
        coveragePercent: Math.round(coveragePercent * 10) / 10
      },
      reasons
    });
  }

  // Sort by overall score descending
  scoredQuotations.sort((a, b) => b.overallScore - a.overallScore);

  const bestRecommendation = scoredQuotations.length > 0 ? scoredQuotations[0] : null;

  return {
    requirementId,
    requirementTitle: rfq.txt_Requirement_Title,
    hasQuotations: true,
    recommendedQuotationId: bestRecommendation ? bestRecommendation.quotationId : null,
    recommendedSupplierName: bestRecommendation ? bestRecommendation.supplierName : null,
    recommendedOverallScore: bestRecommendation ? bestRecommendation.overallScore : null,
    recommendations: scoredQuotations
  };
};

module.exports = {
  getRecommendationWeights,
  calculateRFQRecommendation
};
