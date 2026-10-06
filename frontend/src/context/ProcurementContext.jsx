import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialProjects,
  initialCatalog,
  initialSuppliers,
  initialRFQs,
  initialQuotes,
  initialPurchaseOrders,
  initialDeliveries,
  initialNotifications
} from '../data/mockConstructionData';

const ProcurementContext = createContext();

// Ensure old sample data in localStorage is purged once
if (typeof window !== 'undefined' && !localStorage.getItem('portal_sample_cleared_v1')) {
  localStorage.removeItem('portal_projects');
  localStorage.removeItem('portal_catalog');
  localStorage.removeItem('portal_suppliers');
  localStorage.removeItem('portal_rfqs');
  localStorage.removeItem('portal_quotes');
  localStorage.removeItem('portal_pos');
  localStorage.removeItem('portal_deliveries');
  localStorage.removeItem('portal_notifs');
  localStorage.setItem('portal_sample_cleared_v1', 'true');
}

export const ProcurementProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('portal_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('portal_catalog');
    return saved ? JSON.parse(saved) : initialCatalog;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('portal_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [rfqs, setRfqs] = useState(() => {
    const saved = localStorage.getItem('portal_rfqs');
    return saved ? JSON.parse(saved) : initialRFQs;
  });

  const [quotes, setQuotes] = useState(() => {
    const saved = localStorage.getItem('portal_quotes');
    return saved ? JSON.parse(saved) : initialQuotes;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('portal_pos');
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  const [deliveries, setDeliveries] = useState(() => {
    const saved = localStorage.getItem('portal_deliveries');
    return saved ? JSON.parse(saved) : initialDeliveries;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('portal_notifs');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [toast, setToast] = useState(null);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('portal_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('portal_catalog', JSON.stringify(catalog)); }, [catalog]);
  useEffect(() => { localStorage.setItem('portal_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('portal_rfqs', JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem('portal_quotes', JSON.stringify(quotes)); }, [quotes]);
  useEffect(() => { localStorage.setItem('portal_pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('portal_deliveries', JSON.stringify(deliveries)); }, [deliveries]);
  useEffect(() => { localStorage.setItem('portal_notifs', JSON.stringify(notifications)); }, [notifications]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Add Notification
  const pushNotification = (title, message, type = 'general', roleTarget = 'ALL') => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      timestamp: "Just now",
      read: false,
      type,
      roleTarget
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // 1. BUILDER ACTIONS: Create New Project
  const addProject = (projectData) => {
    const newId = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newProject = {
      id: newId,
      ...projectData,
      materialSpend: 0,
      status: 'Active',
      activeRFQsCount: 0,
      pendingDeliveriesCount: 0,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      targetCompletion: projectData.targetCompletion || "2027-12-31",
      materialBreakdown: projectData.materialBreakdown || {
        steel: Math.round(projectData.budgetAllocated * 0.4),
        cement: Math.round(projectData.budgetAllocated * 0.3),
        electrical: Math.round(projectData.budgetAllocated * 0.15),
        plumbing: Math.round(projectData.budgetAllocated * 0.1),
        other: Math.round(projectData.budgetAllocated * 0.05)
      }
    };
    setProjects(prev => [newProject, ...prev]);

    pushNotification(
      "New Construction Site Registered",
      `Project ${projectData.name} (${newId}) created with budget ₹${(projectData.budgetAllocated / 100000).toFixed(2)} Lakhs.`,
      "project",
      "BUILDER"
    );
    showToast(`Project "${projectData.name}" created successfully!`);
    return newProject;
  };

  // 2. BUILDER ACTIONS: Create RFQ
  const createRFQ = (rfqData) => {
    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRFQ = {
      id: newId,
      ...rfqData,
      status: 'Broadcasted',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setRfqs(prev => [newRFQ, ...prev]);

    setProjects(prev => prev.map(p => {
      if (p.id === rfqData.projectId) {
        return { ...p, activeRFQsCount: (p.activeRFQsCount || 0) + 1 };
      }
      return p;
    }));

    pushNotification(
      "New Material RFQ Broadcasted",
      `RFQ ${newId} (${rfqData.projectName}) created for ${rfqData.items.length} line item(s).`,
      "rfq",
      "SUPPLIER"
    );
    showToast(`RFQ ${newId} broadcasted to eligible suppliers successfully!`);
    return newRFQ;
  };

  // 3. SUPPLIER ACTIONS: Submit Quotation
  const submitQuotation = (quoteData) => {
    const newQuoteId = `QTE-${Math.floor(5000 + Math.random() * 4000)}`;
    const newQuote = {
      id: newQuoteId,
      ...quoteData,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    };
    setQuotes(prev => [newQuote, ...prev]);

    setRfqs(prev => prev.map(r => {
      if (r.id === quoteData.rfqId && r.status === 'Broadcasted') {
        return { ...r, status: 'Quotes Received' };
      }
      return r;
    }));

    pushNotification(
      "New Quote Received",
      `${quoteData.supplierName} submitted a bid of ₹${(quoteData.grandTotal / 100000).toFixed(2)} Lakhs for RFQ ${quoteData.rfqId}.`,
      "quote",
      "BUILDER"
    );
    showToast(`Quotation ${newQuoteId} submitted successfully!`);
    return newQuote;
  };

  // 4. BUILDER ACTIONS: Accept Quote & Issue PO
  const acceptQuoteAndGeneratePO = (quoteId) => {
    const targetQuote = quotes.find(q => q.id === quoteId);
    if (!targetQuote) return;

    const targetRFQ = rfqs.find(r => r.id === targetQuote.rfqId);
    const targetSupplier = suppliers.find(s => s.id === targetQuote.supplierId);

    setQuotes(prev => prev.map(q => {
      if (q.rfqId === targetQuote.rfqId) {
        return { ...q, status: q.id === quoteId ? 'Accepted' : 'Rejected' };
      }
      return q;
    }));

    setRfqs(prev => prev.map(r => {
      if (r.id === targetQuote.rfqId) {
        return { ...r, status: 'PO Issued' };
      }
      return r;
    }));

    const newPOId = `PO-2026-${Math.floor(4000 + Math.random() * 999)}`;
    const newPO = {
      id: newPOId,
      rfqId: targetQuote.rfqId,
      quotationId: targetQuote.id,
      projectId: targetRFQ ? targetRFQ.projectId : 'PRJ-2026-088',
      projectName: targetRFQ ? targetRFQ.projectName : 'Construction Site',
      siteEngineer: "Vikram Malhotra",
      supplierId: targetQuote.supplierId,
      supplierName: targetQuote.supplierName,
      supplierGSTIN: targetSupplier ? targetSupplier.gstin : "07AAACA1234F1Z5",
      poDate: new Date().toISOString().split('T')[0],
      deliverySiteAddress: targetRFQ ? targetRFQ.siteAddress : 'Site Location',
      items: targetQuote.lineItemQuotes.map(item => ({
        name: item.itemName,
        specifications: "Standard Mill Spec",
        quantity: item.quantity,
        unit: item.unit || "Units",
        unitPrice: item.unitPrice,
        gstPercent: item.gstPercent,
        totalAmount: item.totalPrice
      })),
      subtotal: targetQuote.subtotal,
      taxTotal: targetQuote.taxTotal,
      freightCharges: targetQuote.freightCharges,
      grandTotal: targetQuote.grandTotal,
      paymentTerms: targetQuote.paymentTerms,
      fulfillmentStatus: 'Issued'
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    setProjects(prev => prev.map(p => {
      if (p.id === newPO.projectId) {
        return {
          ...p,
          materialSpend: p.materialSpend + newPO.grandTotal,
          activeRFQsCount: Math.max(0, p.activeRFQsCount - 1),
          pendingDeliveriesCount: (p.pendingDeliveriesCount || 0) + 1
        };
      }
      return p;
    }));

    pushNotification(
      "Purchase Order Issued!",
      `Official ${newPOId} issued to ${newPO.supplierName} for amount ₹${(newPO.grandTotal / 100000).toFixed(2)} Lakhs.`,
      "po",
      "ALL"
    );
    showToast(`Purchase Order ${newPOId} generated & sent to supplier!`);
    return newPO;
  };

  // 5. SUPPLIER ACTIONS: Dispatch Order
  const dispatchOrder = (poId, dispatchDetails) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return {
          ...po,
          fulfillmentStatus: 'Dispatched',
          dispatchDetails: {
            ...dispatchDetails,
            dispatchedAt: new Date().toLocaleString()
          }
        };
      }
      return po;
    }));

    const targetPO = purchaseOrders.find(p => p.id === poId);

    const newDeliveryId = `GRN-2026-${Math.floor(1000 + Math.random() * 8999)}`;
    const newDelivery = {
      id: newDeliveryId,
      poId: poId,
      projectId: targetPO ? targetPO.projectId : 'PRJ-2026-088',
      projectName: targetPO ? targetPO.projectName : 'Construction Site',
      supplierId: targetPO ? targetPO.supplierId : 'SUP-001',
      supplierName: targetPO ? targetPO.supplierName : 'Supplier',
      vehicleNumber: dispatchDetails.vehicleNumber,
      driverName: dispatchDetails.driverName,
      driverContact: dispatchDetails.driverContact,
      challanNumber: dispatchDetails.challanNumber,
      ewayBillNumber: dispatchDetails.ewayBillNumber,
      dispatchedDate: new Date().toISOString().split('T')[0],
      deliveredDate: new Date().toISOString().split('T')[0],
      status: 'Pending Site Sign-Off',
      items: targetPO ? targetPO.items.map(i => ({
        name: i.name,
        orderedQty: i.quantity,
        unit: i.unit,
        acceptedQty: i.quantity,
        damagedQty: 0,
        shortageQty: 0,
        remarks: "Good condition upon arrival."
      })) : [],
      inspectedBy: "Pending Inspector",
      siteEngineerNotes: "",
      grnSignedAt: null
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    pushNotification(
      "Truck Dispatched to Site",
      `Vehicle ${dispatchDetails.vehicleNumber} dispatched for ${poId}. Challan #${dispatchDetails.challanNumber}.`,
      "dispatch",
      "BUILDER"
    );
    showToast(`Order ${poId} dispatched! Track delivery in Site Deliveries view.`);
  };

  // 6. BUILDER ACTIONS: GRN Site Sign-Off
  const submitGRNSignOff = (deliveryId, grnData) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return {
          ...del,
          status: grnData.hasDiscrepancy ? 'Discrepancy Flagged' : 'Approved / GRN Issued',
          items: grnData.items,
          inspectedBy: grnData.inspectedBy,
          siteEngineerNotes: grnData.siteEngineerNotes,
          grnSignedAt: new Date().toLocaleString()
        };
      }
      return del;
    }));

    const targetDel = deliveries.find(d => d.id === deliveryId);
    if (targetDel && targetDel.poId) {
      setPurchaseOrders(prev => prev.map(po => {
        if (po.id === targetDel.poId) {
          return { ...po, fulfillmentStatus: 'Delivered' };
        }
        return po;
      }));
    }

    pushNotification(
      "GRN Delivery Sign-Off Complete",
      `Goods Received Note ${deliveryId} signed off by ${grnData.inspectedBy}.`,
      "delivery",
      "ALL"
    );
    showToast(`GRN ${deliveryId} signed off and site inventory updated!`);
  };

  // 7. SUPPLIER CATALOG ACTIONS
  const addCatalogItem = (newItem) => {
    const item = {
      id: `CAT-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: "SUP-001",
      supplierName: "Apex Steel Mills Ltd",
      ...newItem
    };
    setCatalog(prev => [item, ...prev]);
    showToast("New item added to supplier catalog!");
  };

  const updateCatalogItem = (updatedItem) => {
    setCatalog(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    showToast("Catalog item updated!");
  };

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Reset demo state
  const resetDemoData = () => {
    setProjects(initialProjects);
    setCatalog(initialCatalog);
    setSuppliers(initialSuppliers);
    setRfqs(initialRFQs);
    setQuotes(initialQuotes);
    setPurchaseOrders(initialPurchaseOrders);
    setDeliveries(initialDeliveries);
    setNotifications(initialNotifications);
    localStorage.clear();
    showToast("Demo dataset reset to initial state!");
  };

  return (
    <ProcurementContext.Provider value={{
      projects,
      catalog,
      suppliers,
      rfqs,
      quotes,
      purchaseOrders,
      deliveries,
      notifications,
      toast,
      showToast,
      addProject,
      createRFQ,
      submitQuotation,
      acceptQuoteAndGeneratePO,
      dispatchOrder,
      submitGRNSignOff,
      addCatalogItem,
      updateCatalogItem,
      markNotificationRead,
      clearAllNotifications,
      resetDemoData
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const usePortal = () => useContext(ProcurementContext);
