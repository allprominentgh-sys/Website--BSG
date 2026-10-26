
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/supabase-browser";

type DocumentType = "invoice" | "receipt";
type CustomerType = "individual" | "company";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
};

type SellerDetails = {
  name: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
  taxId: string;
};

type BusinessDocument = {
  id: string;
  seller_id: string;
  document_type: DocumentType;
  document_number: string;
  customer_type: CustomerType;
  customer_name: string;
  customer_company_name: string | null;
  customer_contact_person: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_registration_number: string | null;
  customer_tax_id: string | null;
  seller_business_name: string | null;
  seller_business_address: string | null;
  seller_business_phone: string | null;
  seller_business_email: string | null;
  seller_business_registration_number: string | null;
  seller_business_tax_id: string | null;
  issue_date: string;
  currency_code: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string | null;
  notes: string | null;
  items: LineItem[];
  created_at: string;
};

const DOCUMENT_COLUMNS =
  "id,seller_id,document_type,document_number,customer_type,customer_name,customer_company_name,customer_contact_person,customer_phone,customer_email,customer_address,customer_registration_number,customer_tax_id,seller_business_name,seller_business_address,seller_business_phone,seller_business_email,seller_business_registration_number,seller_business_tax_id,issue_date,currency_code,subtotal,discount,total,payment_method,notes,items,created_at";

const emptySeller: SellerDetails = {
  name: "",
  address: "",
  phone: "",
  email: "",
  registrationNumber: "",
  taxId: "",
};

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export default function BusinessToolPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [documentType, setDocumentType] =
    useState<DocumentType>("invoice");
  const [customerType, setCustomerType] =
    useState<CustomerType>("individual");

  const [customerName, setCustomerName] = useState("");
  const [customerCompanyName, setCustomerCompanyName] = useState("");
  const [customerContactPerson, setCustomerContactPerson] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerRegistrationNumber, setCustomerRegistrationNumber] =
    useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");

  const [seller, setSeller] = useState<SellerDetails>(emptySeller);

  const [currency, setCurrency] = useState("GHS");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Math.max(0, item.quantity) * Math.max(0, item.unitPrice),
    0
  );

  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Number(discount) || 0)
  );

  const total = Math.max(0, subtotal - discountAmount);

  const loadDocuments = useCallback(
    async (id: string) => {
      const { data, error: queryError } = await supabase
        .from("business_tool_documents")
        .select(DOCUMENT_COLUMNS)
        .eq("seller_id", id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (queryError) throw queryError;

      setDocuments((data ?? []) as BusinessDocument[]);
    },
    [supabase]
  );

  const loadSellerProfile = useCallback(
    async (id: string, accountEmail: string, accountName: string) => {
      let nextSeller: SellerDetails = {
        ...emptySeller,
        name: accountName,
        email: accountEmail,
      };

      // Use the signed-in user's own company profile when available.
      const { data: company, error: companyError } = await supabase
        .from("company_profiles")
        .select(
          "company_name,registration_number,company_address,company_phone,company_email"
        )
        .eq("user_id", id)
        .limit(1)
        .maybeSingle();

      if (companyError) {
        console.warn("Company profile could not be loaded:", companyError);
      }

      if (company) {
        nextSeller = {
          name: company.company_name || nextSeller.name,
          address: company.company_address || nextSeller.address,
          phone: company.company_phone || nextSeller.phone,
          email: company.company_email || nextSeller.email,
          registrationNumber:
            company.registration_number || nextSeller.registrationNumber,
          taxId: "",
        };
      }

      // Fill any remaining gaps from the user's public profile.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,phone,location,delivery_address")
        .eq("id", id)
        .maybeSingle();

      if (profileError) {
        console.warn("Basic profile could not be loaded:", profileError);
      }

      if (profile) {
        nextSeller = {
          ...nextSeller,
          name: nextSeller.name || profile.full_name || "",
          phone: nextSeller.phone || profile.phone || "",
          address:
            nextSeller.address ||
            profile.delivery_address ||
            profile.location ||
            "",
        };
      }

      setSeller(nextSeller);
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const { data, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!data.user) {
          if (active) {
            setError("Please sign in to use Business Tools.");
            setLoading(false);
          }
          return;
        }

        const id = data.user.id;

        if (active) setUserId(id);

        await Promise.all([
          loadDocuments(id),
          loadSellerProfile(
            id,
            data.user.email || "",
            data.user.user_metadata?.full_name || ""
          ),
        ]);
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Could not load Business Tools. Please refresh.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [supabase, loadDocuments, loadSellerProfile]);

  function updateItem(
    index: number,
    field: keyof LineItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;

        if (field === "description") {
          return { ...item, description: value };
        }

        const numericValue = Math.max(0, Number(value) || 0);

        return {
          ...item,
          [field]:
            field === "quantity"
              ? Math.max(1, Math.floor(numericValue))
              : numericValue,
        };
      })
    );
  }

  function resetForm() {
    setCustomerType("individual");
    setCustomerName("");
    setCustomerCompanyName("");
    setCustomerContactPerson("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerRegistrationNumber("");
    setCustomerTaxId("");
    setDiscount("0");
    setPaymentMethod("Cash");
    setNotes("");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
  }

  async function createDocument(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!userId) {
      setError("Please sign in before creating a document.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() &&
        item.quantity > 0 &&
        item.unitPrice >= 0
    );

    if (customerType === "individual" && !customerName.trim()) {
      setError("Enter the individual customer's full name.");
      return;
    }

    if (
      customerType === "company" &&
      !customerCompanyName.trim()
    ) {
      setError("Enter the customer's company name.");
      return;
    }

    if (validItems.length === 0) {
      setError("Add at least one item with a description.");
      return;
    }

    if (
      !Number.isFinite(subtotal) ||
      !Number.isFinite(total) ||
      !Number.isFinite(discountAmount)
    ) {
      setError("Check the item quantities, prices and discount.");
      return;
    }

    if (!seller.name.trim()) {
      setError(
        "Enter your business name in Seller Business Details before saving."
      );
      return;
    }

    setSaving(true);

    try {
      const cleanItems = validItems.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
      }));

      const savedCustomerName =
        customerType === "company"
          ? customerCompanyName.trim()
          : customerName.trim();

      // Supabase generates the official document number through its trigger.
      const { data: savedDocument, error: insertError } = await supabase
        .from("business_tool_documents")
        .insert({
          seller_id: userId,
          document_type: documentType,
          document_number: "PENDING",

          customer_type: customerType,
          customer_name: savedCustomerName,
          customer_company_name:
            customerType === "company"
              ? customerCompanyName.trim()
              : null,
          customer_contact_person:
            customerType === "company"
              ? customerContactPerson.trim() || null
              : null,
          customer_phone: customerPhone.trim() || null,
          customer_email: customerEmail.trim() || null,
          customer_address: customerAddress.trim() || null,
          customer_registration_number:
            customerType === "company"
              ? customerRegistrationNumber.trim() || null
              : null,
          customer_tax_id:
            customerType === "company"
              ? customerTaxId.trim() || null
              : null,

          seller_business_name: seller.name.trim(),
          seller_business_address: seller.address.trim() || null,
          seller_business_phone: seller.phone.trim() || null,
          seller_business_email: seller.email.trim() || null,
          seller_business_registration_number:
            seller.registrationNumber.trim() || null,
          seller_business_tax_id: seller.taxId.trim() || null,

          issue_date: new Date().toISOString().slice(0, 10),
          currency_code: currency,
          subtotal,
          discount: discountAmount,
          total,
          payment_method:
            documentType === "receipt" ? paymentMethod : null,
          notes: notes.trim() || null,
          items: cleanItems,
        })
        .select(DOCUMENT_COLUMNS)
        .single();

      if (insertError) throw insertError;

      const officialNumber = savedDocument.document_number;

      if (documentType === "receipt") {
        const { error: saleError } = await supabase
          .from("business_tool_sales")
          .insert({
            seller_id: userId,
            receipt_document_id: savedDocument.id,
            sale_number: officialNumber,
            customer_name: savedCustomerName,
            currency_code: currency,
            subtotal,
            discount: discountAmount,
            total,
            payment_method: paymentMethod,
            items: cleanItems,
            sold_at: new Date().toISOString(),
          });

        if (saleError) {
          console.error(
            "Receipt saved but sales record failed:",
            saleError
          );

          setMessage(
            `Receipt ${officialNumber} was saved, but its sales record could not be created. Do not issue another receipt for the same sale until this is checked.`
          );
        } else {
          setMessage(
            `Receipt ${officialNumber} and its sales record were saved.`
          );
        }
      } else {
        setMessage(`Invoice ${officialNumber} was saved successfully.`);
      }

      await loadDocuments(userId);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the document. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function printDocument(document: BusinessDocument) {
    const documentItems = Array.isArray(document.items)
      ? document.items
      : [];

    const itemRows = documentItems
      .map((item) => {
        const lineTotal =
          Number(item.lineTotal) ||
          Number(item.quantity) * Number(item.unitPrice);

        return `
          <tr>
            <td>${escapeHtml(item.description || "")}</td>
            <td>${Number(item.quantity) || 0}</td>
            <td>${escapeHtml(
              money(Number(item.unitPrice) || 0, document.currency_code)
            )}</td>
            <td>${escapeHtml(
              money(lineTotal, document.currency_code)
            )}</td>
          </tr>`;
      })
      .join("");

    const sellerName =
      document.seller_business_name || "Business name not provided";

    const customerHeading =
      document.customer_type === "company"
        ? document.customer_company_name || document.customer_name
        : document.customer_name;

    const customerDetails = [
      document.customer_type === "company"
        ? `Contact person: ${document.customer_contact_person || ""}`
        : "",
      `Phone: ${document.customer_phone || ""}`,
      `Email: ${document.customer_email || ""}`,
      `Address: ${document.customer_address || ""}`,
      document.customer_registration_number
        ? `Registration no.: ${document.customer_registration_number}`
        : "",
      document.customer_tax_id
        ? `Tax ID: ${document.customer_tax_id}`
        : "",
    ].filter(Boolean);

    const sellerDetails = [
      document.seller_business_address,
      document.seller_business_phone
        ? `Phone: ${document.seller_business_phone}`
        : "",
      document.seller_business_email
        ? `Email: ${document.seller_business_email}`
        : "",
      document.seller_business_registration_number
        ? `Registration no.: ${document.seller_business_registration_number}`
        : "",
      document.seller_business_tax_id
        ? `Tax ID: ${document.seller_business_tax_id}`
        : "",
    ].filter(Boolean);

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(document.document_number)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #172033; max-width: 1000px; margin: auto; }
          h1 { color: #123a72; margin-bottom: 4px; }
          h2 { margin-bottom: 8px; }
          .muted { color: #596579; }
          .row { display: flex; justify-content: space-between; gap: 28px; align-items: flex-start; }
          .panel { flex: 1; min-width: 0; }
          .panel p { margin: 5px 0; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { text-align: left; border-bottom: 1px solid #ddd; padding: 10px 6px; overflow-wrap: anywhere; }
          th { background: #f1f5f9; }
          .totals { margin: 24px 0 0 auto; max-width: 320px; }
          .total { font-size: 20px; font-weight: bold; border-top: 2px solid #123a72; padding-top: 10px; }
          .notes { margin-top: 24px; white-space: pre-wrap; }
          @media (max-width: 600px) {
            body { padding: 14px; }
            .row { flex-direction: column; }
            table { font-size: 12px; }
            th, td { padding: 7px 3px; }
          }
          @media print {
            button { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(sellerName)}</h1>
        ${sellerDetails.map((line) => `<p class="muted">${escapeHtml(line || "")}</p>`).join("")}
        <hr>
        <div class="row">
          <div class="panel">
            <h2>${document.document_type === "receipt" ? "RECEIPT" : "INVOICE"}</h2>
            <p><strong>Document no.:</strong> ${escapeHtml(document.document_number)}</p>
            <p><strong>Date:</strong> ${escapeHtml(document.issue_date)}</p>
          </div>
          <div class="panel">
            <h3>${document.customer_type === "company" ? "Bill to — Company" : "Customer"}</h3>
            <p><strong>${escapeHtml(customerHeading)}</strong></p>
            ${customerDetails.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </div>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="totals">
          <p>Subtotal: ${escapeHtml(money(Number(document.subtotal), document.currency_code))}</p>
          <p>Discount: ${escapeHtml(money(Number(document.discount), document.currency_code))}</p>
          <p class="total">Total: ${escapeHtml(money(Number(document.total), document.currency_code))}</p>
        </div>
        ${document.payment_method ? `<p><strong>Payment method:</strong> ${escapeHtml(document.payment_method)}</p>` : ""}
        ${document.notes ? `<div class="notes"><strong>Notes:</strong><br>${escapeHtml(document.notes)}</div>` : ""}
        <p class="muted">Thank you for your business.</p>
        <button onclick="window.print()">Print / Save as PDF</button>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      setError(
        "Your browser blocked the print window. Allow pop-ups and try again."
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        Loading Business Tools…
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/" className="text-blue-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Business Tools</h1>
        <p className="mt-3">
          {error || "Please sign in to continue."}
        </p>
        <Link
          href="/account"
          className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-3 text-white"
        >
          Go to My Account
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-blue-700 hover:underline">
            ← Marketplace
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Business Tools
          </h1>
          <p className="mt-1 text-slate-600">
            Invoices, receipts and sales records.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
          Business workspace
        </span>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">Create a document</h2>

          <form onSubmit={createDocument} className="mt-5 space-y-5">
            <div>
              <label htmlFor="documentType" className="mb-1 block text-sm font-medium">
                Document type
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as DocumentType)}
                className="w-full rounded-lg border border-slate-300 p-3"
              >
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt — records a sale</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3">
                <h3 className="font-bold">Seller Business Details</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Prefilled from your company profile where available. Edit
                  these details for this document if necessary.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="sellerName" className="mb-1 block text-sm font-medium">
                    Business or seller name *
                  </label>
                  <input
                    id="sellerName"
                    required
                    value={seller.name}
                    onChange={(event) => setSeller({ ...seller, name: event.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>

                <div>
                  <label htmlFor="sellerAddress" className="mb-1 block text-sm font-medium">
                    Business address
                  </label>
                  <textarea
                    id="sellerAddress"
                    rows={2}
                    value={seller.address}
                    onChange={(event) => setSeller({ ...seller, address: event.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sellerPhone" className="mb-1 block text-sm font-medium">
                      Business phone
                    </label>
                    <input
                      id="sellerPhone"
                      type="tel"
                      value={seller.phone}
                      onChange={(event) => setSeller({ ...seller, phone: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                  </div>
                  <div>
                    <label htmlFor="sellerEmail" className="mb-1 block text-sm font-medium">
                      Business email
                    </label>
                    <input
                      id="sellerEmail"
                      type="email"
                      value={seller.email}
                      onChange={(event) => setSeller({ ...seller, email: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sellerRegistration" className="mb-1 block text-sm font-medium">
                      Registration number
                    </label>
                    <input
                      id="sellerRegistration"
                      value={seller.registrationNumber}
                      onChange={(event) => setSeller({ ...seller, registrationNumber: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                  </div>
                  <div>
                    <label htmlFor="sellerTaxId" className="mb-1 block text-sm font-medium">
                      Tax ID / TIN
                    </label>
                    <input
                      id="sellerTaxId"
                      value={seller.taxId}
                      onChange={(event) => setSeller({ ...seller, taxId: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 font-bold">Customer Details</h3>

              <label htmlFor="customerType" className="mb-1 block text-sm font-medium">
                Customer type
              </label>
              <select
                id="customerType"
                value={customerType}
                onChange={(event) => {
                  setCustomerType(event.target.value as CustomerType);
                  setError("");
                }}
                className="mb-4 w-full rounded-lg border border-slate-300 p-3"
              >
                <option value="individual">Individual customer</option>
                <option value="company">Registered company / business</option>
              </select>

              {customerType === "individual" ? (
                <div>
                  <label htmlFor="customerName" className="mb-1 block text-sm font-medium">
                    Customer full name *
                  </label>
                  <input
                    id="customerName"
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="customerCompany" className="mb-1 block text-sm font-medium">
                      Company name *
                    </label>
                    <input
                      id="customerCompany"
                      required
                      value={customerCompanyName}
                      onChange={(event) => setCustomerCompanyName(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerContactPerson" className="mb-1 block text-sm font-medium">
                      Contact person
                    </label>
                    <input
                      id="customerContactPerson"
                      value={customerContactPerson}
                      onChange={(event) => setCustomerContactPerson(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="customerRegistration" className="mb-1 block text-sm font-medium">
                        Company registration no.
                      </label>
                      <input
                        id="customerRegistration"
                        value={customerRegistrationNumber}
                        onChange={(event) => setCustomerRegistrationNumber(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-3"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerTaxId" className="mb-1 block text-sm font-medium">
                        Tax ID / TIN
                      </label>
                      <input
                        id="customerTaxId"
                        value={customerTaxId}
                        onChange={(event) => setCustomerTaxId(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>
                <div>
                  <label htmlFor="customerEmail" className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="customerAddress" className="mb-1 block text-sm font-medium">
                  {customerType === "company" ? "Company address" : "Customer address"}
                </label>
                <textarea
                  id="customerAddress"
                  rows={2}
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="currency" className="mb-1 block text-sm font-medium">
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3"
                >
                  <option value="GHS">GHS — Ghana cedi</option>
                  <option value="USD">USD — US dollar</option>
                  <option value="GBP">GBP — British pound</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="CNY">CNY — Chinese yuan</option>
                </select>
              </div>
              <div>
                <label htmlFor="discount" className="mb-1 block text-sm font-medium">
                  Discount ({currency})
                </label>
                <input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3"
                />
              </div>
            </div>

            {documentType === "receipt" && (
              <div>
                <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium">
                  Payment method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3"
                >
                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>Other</option>
                </select>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-semibold">Items</h3>
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) => [
                      ...current,
                      { description: "", quantity: 1, unitPrice: 0 },
                    ])
                  }
                  className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700"
                >
                  + Add item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="rounded-xl bg-slate-50 p-3">
                    <label className="mb-1 block text-sm font-medium">
                      Item description
                    </label>
                    <input
                      required
                      value={item.description}
                      onChange={(event) => updateItem(index, "description", event.target.value)}
                      placeholder="Product or service"
                      className="w-full rounded-lg border border-slate-300 p-3"
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={item.quantity}
                          onChange={(event) => updateItem(index, "quantity", event.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-3"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">
                          Unit price ({currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-3"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Line total</span>
                      <strong>
                        {money(item.quantity * item.unitPrice, currency)}
                      </strong>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                        className="mt-2 text-sm text-red-700 hover:underline"
                      >
                        Remove item
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{money(subtotal, currency)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Discount</span>
                <span>{money(discountAmount, currency)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-600 pt-3 text-xl font-bold">
                <span>Total</span>
                <span>{money(total, currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving document…" : `Create ${documentType}`}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold">Recent documents</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your latest 100 invoices and receipts.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                userId &&
                loadDocuments(userId).catch(() =>
                  setError("Could not refresh documents.")
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              Refresh
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-3xl">🧾</p>
              <p className="mt-2 font-semibold">No documents yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Create your first invoice or receipt using the form.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          document.document_type === "receipt"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {document.document_type.toUpperCase()}
                      </span>
                      <h3 className="mt-2 font-bold">
                        {document.document_number}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {document.customer_name}
                      </p>
                      {document.customer_type === "company" && (
                        <p className="text-xs text-slate-500">Company customer</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {document.issue_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {money(Number(document.total), document.currency_code)}
                      </p>
                      <button
                        type="button"
                        onClick={() => printDocument(document)}
                        className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        Print / Save PDF
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
