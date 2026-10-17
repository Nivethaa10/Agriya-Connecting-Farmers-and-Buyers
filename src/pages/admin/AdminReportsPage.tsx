import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, CreditCard, FileText, Sprout, X } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api.ts';

interface ReportRow {
  _id: string;
  count: number;
  totalTons?: number;
  totalAmount?: number;
}

interface Reports {
  contractsByCategory: ReportRow[];
  contractsByStatus: ReportRow[];
  paymentsByStatus: ReportRow[];
  relationshipsByStage: ReportRow[];
}

type DetailType = 'contractCategory' | 'contractStatus' | 'paymentStatus' | 'lifecycleStage';

interface ReportSelection {
  type: DetailType;
  value: string;
  heading: string;
}

interface ContractDetail {
  _id: string;
  title?: string;
  cropName?: string;
  category?: string;
  buyerName?: string;
  buyerOrganization?: string;
  quantityRequiredTons?: number;
  pricePerTon?: number;
  status?: string;
  createdAt?: string;
}

interface PaymentDetail {
  _id: string;
  bankReferenceNumber?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paidAt?: string;
  createdAt?: string;
  farmerId?: { _id?: string; name?: string } | null;
  buyerId?: { _id?: string; name?: string } | null;
  relationshipId?: {
    contractId?: { _id?: string; title?: string; cropName?: string } | null;
    farmerId?: { _id?: string; name?: string } | null;
    buyerId?: { _id?: string; name?: string } | null;
  } | null;
}

interface RelationshipDetail {
  _id: string;
  lifecycleStage?: string;
  cropName?: string;
  progressPercentage?: number;
  updatedAt?: string;
  contractId?: { _id?: string; title?: string; category?: string } | null;
  farmerId?: { _id?: string; name?: string } | null;
  buyerId?: { _id?: string; name?: string } | null;
  latestProgress?: {
    stageName?: string;
    progressPercentage?: number;
    recordedAt?: string;
    notes?: string;
  } | null;
}

interface ReportDetails {
  count: number;
  totalAmount?: number;
  records: ContractDetail[] | PaymentDetail[] | RelationshipDetail[];
}

interface AdminReportsPageProps {
  onNavigate: (path: string) => void;
}

const titleCase = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<ReportSelection | null>(null);
  const [details, setDetails] = useState<ReportDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const detailRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    api.get('/admin/reports')
      .then((response) => {
        if (active && response.data.success) setReports(response.data.reports);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openDetails = async (type: DetailType, value: string) => {
    const requestId = ++detailRequestId.current;
    setSelection({
      type,
      value,
      heading: `${titleCase(value)} ${type.startsWith('contract') ? 'Contracts' : type === 'paymentStatus' ? 'Payments' : 'Relationships'}`,
    });
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const response = await api.get('/admin/reports/details', {
        params: { type, value },
      });
      if (requestId !== detailRequestId.current) return;
      const result = response.data as Partial<ReportDetails> & { success?: boolean };
      if (result?.success === true && typeof result.count === 'number' && Array.isArray(result.records)) {
        setDetails(result as ReportDetails);
      } else {
        if (import.meta.env.DEV) {
          console.error('Admin report details returned an unexpected response.', {
            type,
            status: response.status,
            contentType: response.headers['content-type'],
            responseType: typeof response.data,
          });
        }
        setDetailsError('The report details could not be loaded.');
      }
    } catch (requestError) {
      if (requestId === detailRequestId.current) {
        if (import.meta.env.DEV) {
          let status: number | undefined;
          if (requestError && typeof requestError === 'object' && 'response' in requestError) {
            const response = requestError.response;
            if (
              response &&
              typeof response === 'object' &&
              'status' in response &&
              typeof response.status === 'number'
            ) {
              status = response.status;
            }
          }
          console.error('Admin report details request failed.', {
            type,
            status,
            errorName: requestError instanceof Error ? requestError.name : 'UnknownError',
          });
        }
        setDetailsError(getErrorMessage(requestError));
      }
    } finally {
      if (requestId === detailRequestId.current) setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    detailRequestId.current += 1;
    setSelection(null);
    setDetails(null);
    setDetailsLoading(false);
    setDetailsError(null);
  };

  const renderRows = (
    rows: ReportRow[] | undefined,
    valueLabel: string,
    type: DetailType,
    unit?: string
  ) => {
    if (!rows?.length) {
      return <p className="py-6 text-center text-xs text-neutral-500">No report data available.</p>;
    }
    return (
      <div className="divide-y divide-neutral-100">
        {rows.map((row) => (
          <button
            key={row._id}
            type="button"
            onClick={() => openDetails(type, row._id)}
            aria-label={`View ${row._id} ${valueLabel}`}
            className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 cursor-pointer"
          >
            <span className="text-neutral-700">{titleCase(row._id || 'unknown')}</span>
            <span className="text-right font-semibold tabular-nums text-neutral-900">
              {row.count.toLocaleString('en-IN')} {valueLabel}
              {unit && row.totalTons !== undefined
                ? ` · ${row.totalTons.toLocaleString('en-IN')} ${unit}`
                : ''}
              {row.totalAmount !== undefined
                ? ` · ₹${row.totalAmount.toLocaleString('en-IN')}`
                : ''}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const sections = reports
    ? [
        {
          title: 'Contracts by category',
          icon: Sprout,
          content: renderRows(reports.contractsByCategory, 'contracts', 'contractCategory', 'tons'),
        },
        {
          title: 'Contracts by status',
          icon: FileText,
          content: renderRows(reports.contractsByStatus, 'contracts', 'contractStatus'),
        },
        {
          title: 'Payments by status',
          icon: CreditCard,
          content: renderRows(reports.paymentsByStatus, 'payments', 'paymentStatus'),
        },
        {
          title: 'Relationships by lifecycle stage',
          icon: BarChart3,
          content: renderRows(reports.relationshipsByStage, 'relationships', 'lifecycleStage'),
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">Platform administration</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">System Reports</h1>
          <p className="mt-1 text-sm text-neutral-600">Operational summaries for contracts, payments, and active relationships.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" /> Admin dashboard
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-500">
          Loading system reports...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">{error}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map(({ title, icon: Icon, content }) => (
            <section key={title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-neutral-900">
                <Icon className="h-5 w-5 text-emerald-800" /> {title}
              </h2>
              {content}
            </section>
          ))}
        </div>
      )}

      {selection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetails();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-details-title"
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2 id="report-details-title" className="font-heading text-xl font-bold text-neutral-900">
                  {selection.heading}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {details ? `${details.count.toLocaleString('en-IN')} matching records` : 'Matching records'}
                  {details?.totalAmount !== undefined
                    ? ` · Total ${details.totalAmount.toLocaleString('en-IN')} ${((details.records as PaymentDetail[])[0]?.currency || 'INR')}`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close report details"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </header>

            <div className="overflow-y-auto p-6">
              {detailsLoading ? (
                <div role="status" className="py-12 text-center text-sm text-neutral-500">
                  Loading matching records...
                </div>
              ) : detailsError ? (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                  {detailsError}
                </div>
              ) : !details?.records.length ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No records currently match this report item.
                </div>
              ) : selection.type === 'contractCategory' || selection.type === 'contractStatus' ? (
                <div className="space-y-3">
                  {(details.records as ContractDetail[]).map((contract) => (
                    <article key={contract._id} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-neutral-900">{contract.title || 'Untitled contract'}</h3>
                          <p className="mt-1 text-xs text-neutral-500">
                            Contract ID: <span className="font-mono">{contract._id}</span>
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-900">
                          {titleCase(contract.status || 'unknown')}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                        <DetailField label="Crop / category" value={`${contract.cropName || 'Not specified'} · ${contract.category || 'Not specified'}`} />
                        <DetailField label="Buyer / organization" value={contract.buyerOrganization || contract.buyerName || 'Not available'} />
                        <DetailField label="Quantity demanded" value={contract.quantityRequiredTons === undefined ? 'Not available' : `${contract.quantityRequiredTons.toLocaleString('en-IN')} metric tons`} />
                        <DetailField label="Price per metric ton" value={contract.pricePerTon === undefined ? 'Not available' : `₹${contract.pricePerTon.toLocaleString('en-IN')}`} />
                        <DetailField label="Created" value={formatDate(contract.createdAt)} />
                      </dl>
                    </article>
                  ))}
                </div>
              ) : selection.type === 'paymentStatus' ? (
                <div className="space-y-3">
                  {(details.records as PaymentDetail[]).map((payment) => (
                    <article key={payment._id} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {payment.bankReferenceNumber || 'Payment'} <span className="font-normal text-neutral-500">· {payment._id}</span>
                          </h3>
                          <p className="mt-1 text-xs text-neutral-600">
                            {payment.relationshipId?.contractId?.title || payment.relationshipId?.contractId?.cropName || 'Contract details unavailable'}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-900">
                          {titleCase(payment.status || 'unknown')}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                        <DetailField label="Farmer" value={payment.relationshipId?.farmerId?.name || payment.farmerId?.name || 'Not available'} />
                        <DetailField label="Buyer" value={payment.relationshipId?.buyerId?.name || payment.buyerId?.name || 'Not available'} />
                        <DetailField label="Amount" value={`${payment.currency || 'INR'} ${Number(payment.amount || 0).toLocaleString('en-IN')}`} />
                        <DetailField label="Transaction date" value={formatDate(payment.paidAt || payment.createdAt)} />
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(details.records as RelationshipDetail[]).map((relationship) => (
                    <article key={relationship._id} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {relationship.contractId?.title || relationship.cropName || 'Contract relationship'}
                          </h3>
                          <p className="mt-1 text-xs text-neutral-500">
                            Relationship ID: <span className="font-mono">{relationship._id}</span>
                            {relationship.contractId?._id && <> · Contract ID: <span className="font-mono">{relationship.contractId._id}</span></>}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-900">
                          {titleCase(relationship.lifecycleStage || selection.value)} · {relationship.progressPercentage ?? 0}%
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                        <DetailField label="Farmer" value={relationship.farmerId?.name || 'Not available'} />
                        <DetailField label="Buyer" value={relationship.buyerId?.name || 'Not available'} />
                        <DetailField label="Latest progress" value={relationship.latestProgress?.stageName || 'No progress update'} />
                        <DetailField label="Progress update time" value={formatDate(relationship.latestProgress?.recordedAt)} />
                        <DetailField label="Latest note" value={relationship.latestProgress?.notes || 'No note available'} />
                        <DetailField label="Relationship updated" value={formatDate(relationship.updatedAt)} />
                      </dl>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const formatDate = (value?: string) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleString('en-IN')
    : 'Not available';

const DetailField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt className="text-neutral-500">{label}</dt>
    <dd className="mt-0.5 break-words font-medium text-neutral-800">{value}</dd>
  </div>
);
