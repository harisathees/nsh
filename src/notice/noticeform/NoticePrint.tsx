import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import * as htmlToImage from 'html-to-image';
import { FiShare2, FiLoader } from 'react-icons/fi'; // <-- Added icon imports
import bg1 from '../../assets/front.jpg';
import bg2 from '../../assets/back.jpg';

// Spinner Component (no changes)
const GoldCoinSpinner: React.FC<{ text?: string }> = ({ text = "Loading pledge data..." }) => (
  <div className="flex flex-col items-center justify-center py-20" aria-label="Loading">
    <svg className="coin-spinner w-16 h-16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4"/>
      <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
    </svg>
    <p className="mt-4 text-sm font-semibold text-amber-800">{text}</p>
  </div>
);

// Supabase Client (no changes)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// formatDate function (no changes)
const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const NoticePrint = () => {
  const { loanId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // --- 1. ADD NEW STATE for loading animation ---
  const [sharingTarget, setSharingTarget] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestRates = async () => {
      const { data, error } = await supabase
        .from("metal_rates")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Rate fetch error", error);
        return { goldRate: 0, silverRate: 0 };
      }

      const goldRate = data.find((r) => r.metal_type === "Gold")?.rate || 0;
      const silverRate = data.find((r) => r.metal_type === "Silver")?.rate || 0;

      return { goldRate, silverRate };
    };

    const fetchData = async () => {
      if (!loanId) return;

      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError || !loan) {
        console.error('Loan fetch error:', loanError);
        return;
      }

      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', loan.customer_id)
        .single();

      const { data: jewel } = await supabase
        .from('jewels')
        .select('*')
        .eq('loan_id', loanId)
        .limit(1)
        .single();

      const customerImageUrl = customer?.photo_url || null;
      const jewelImageUrl = jewel?.image_url || null;

      const { goldRate, silverRate } = await fetchLatestRates();

      setData({
        name: customer?.name,
        address: customer?.address,
        phone: customer?.mobile_no,
        whatsapp: customer?.whatsapp_no,
        date: formatDate(loan.date),
        duedate: formatDate(loan.duedate),
        weight: jewel?.net_weight,
        interest: loan?.interest_rate,
        jewelName: jewel?.description || 'N/A',
        faults: jewel?.faults || 'N/A',
        quality: jewel?.quality || 'N/A',
        count: jewel?.pieces || 1,
        itemNo: loan.loan_no,
        amount: loan.amount,
        customerImage: customerImageUrl,
        jewelImage: jewelImageUrl,
        goldRate: loan.gold_rate ?? goldRate,
        silverRate: loan.silver_rate ?? silverRate,
      });

      setLoading(false);
    };

    fetchData();
  }, [loanId]);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // --- 2. UPDATE handleShare function to manage loading state ---
  const handleShare = async (ref: React.RefObject<HTMLDivElement>, filename: string, target: string) => {
    setSharingTarget(target); // Start loading
    try {
      if (!ref.current) return;

      const scale = 3;
      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1,
        pixelRatio: scale,
        cacheBust: true,
      });

      if (isMobile && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], filename, { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "Loan Notice",
          text: "Please find the notice attached",
        });
      } else {
        // Desktop print logic...
        const iframe = document.createElement("iframe");
        iframe.id = "print-frame";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <html>
            <head>
              <title>${filename}</title>
              <style>
                @page { size: A4; margin: 0; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; }
                img { width: 210mm; height: 297mm; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" />
              <script>
                window.onload = function() { window.print(); };
                window.onafterprint = function() { parent.document.body.removeChild(parent.document.querySelector("#print-frame")); };
              </script>
            </body>
            </html>
          `);
          doc.close();
        }
      }
    } catch (error) {
      console.error("Error handling share/print:", error);
    } finally {
      setSharingTarget(null); // ALWAYS stop loading
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <GoldCoinSpinner text="Loading pledge data..." />
      </div>
    );
  }

  return (
    <>
      {/* --- 3. REPLACE old buttons with new animated buttons --- */}
      <div className="flex justify-center gap-5 my-5">
        <button
          onClick={() => handleShare(frontRef, 'notice-front.png', 'front')}
          disabled={sharingTarget !== null}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-wait"
        >
          {sharingTarget === 'front' ? (
            <>
              <FiLoader className="animate-spin" />
              <span>Sharing...</span>
            </>
          ) : (
            <>
              <FiShare2 size={16} />
              <span>Share Front Page</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleShare(backRef, 'notice-back.png', 'back')}
          disabled={sharingTarget !== null}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-wait"
        >
          {sharingTarget === 'back' ? (
            <>
              <FiLoader className="animate-spin" />
              <span>Sharing...</span>
            </>
          ) : (
            <>
              <FiShare2 size={16} />
              <span>Share Back Page</span>
            </>
          )}
        </button>
      </div>


      {/* Front */}
      <div
        ref={frontRef}
        style={{ position: 'relative', width: '210mm', height: '297mm', margin: '0 auto', overflow: 'hidden' }}
      >
        <img src={bg1} alt="front" style={{ position: 'absolute', width: '210mm', height: '297mm' }} />
        {data.customerImage && (
          <div style={{
            position: 'absolute', top: '90mm', left: '64mm', width: '26mm', height: '33mm',
            transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
            border: '2px solid black', zIndex: 1,
          }}>
            <img src={data.customerImage} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {data.jewelImage && (
          <div style={{
            position: 'absolute', top: '120mm', left: '179mm', width: '26mm', height: '33mm',
            transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
            border: '2px solid black', zIndex: 1,
          }}>
            <img src={data.jewelImage} alt="Jewel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {data.customerImage && (
          <div style={{
            position: 'absolute', top: '91mm', left: '179mm', width: '26mm', height: '33mm',
            transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
            border: '2px solid black', zIndex: 1,
          }}>
            <img src={data.customerImage} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {data.jewelImage && (
          <div style={{
            position: 'absolute', top: '119mm', left: '64mm', width: '26mm', height: '33mm',
            transform: 'rotate(90deg)', transformOrigin: 'left top', overflow: 'hidden',
            border: '2px solid black', zIndex: 1,
          }}>
            <img src={data.jewelImage} alt="Jewel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {fields(data).map((field, index) => (
          <div key={index} style={{
            position: 'absolute',
            top: field.top, left: field.left,
            transform: 'rotate(90deg)', transformOrigin: 'left top',
            fontSize: '15px', zIndex: 1, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150mm'
          }}>
            <b>{field.label}</b>
          </div>
        ))}
      </div>

      {/* Back */}
      <div ref={backRef} style={{ width: '210mm', height: '297mm', margin: '0 auto', pageBreakBefore: 'always' }}>
        <img src={bg2} alt="back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </>
  );
};

// The old buttonStyle function is no longer needed and can be removed.
// const buttonStyle = (bg: string) => ({...});

const fields = (data: any) => [
  //officer copy
  { top: '100.5mm', left: '201mm', label: `Date:${data.date}` },
  { top: '100.5mm', left: '196mm', label: `Due :${data.duedate}` },
  { top: '100.5mm', left: '188mm', label: `G:${data.goldRate}` },
  { top: '121.5mm', left: '188mm', label: `S:${data.silverRate}` },
  { top: '2.5mm', left: '188mm', label: `Rate/g: ₹${(data.weight > 0 ? (data.amount / data.weight).toFixed(2) : '0.0')}` },
  { top: '2.5mm', left: '181mm', label: `கடன் எண்:${data.itemNo}` },
  { top: '2.5mm', left: '174mm', label: `தரம்:${data.quality}` },
  { top: '2.5mm', left: '167mm', label: `Pcs: ${data.count}` },
  { top: '2.5mm', left: '160mm', label: `வட்டி: ${data.interest}%` },
  { top: '2.5mm', left: '153mm', label: `Faults: ${data.faults}` },
  { top: '2.5mm', left: '146mm', label: `பொருள்: ${data.jewelName}` },
  { top: '2.5mm', left: '139mm', label: `முகவரி: ${data.address}` },
  { top: '44mm', left: '180mm', label: `பெயர்: ${data.name}` },
  { top: '44mm', left: '172mm', label: `தொகை: ₹${data.amount}/-` },
  { top: '44mm', left: '164mm', label: `எடை: ${data.weight}g` },
  { top: '44mm', left: '156mm', label: ` ${data.phone},${data.whatsapp}` },

  //customer copy
  { top: '100.5mm', left: '95mm', label: `Date:${data.date}` },
  { top: '100.5mm', left: '90mm', label: `Due :${data.duedate}` },
  { top: '2.5mm', left: '80mm', label: `Rate/g: ₹${(data.weight > 0 ? (data.amount / data.weight).toFixed(2) : '0.0')}` },
  { top: '2.5mm', left: '70mm', label: `கடன் எண்:${data.itemNo}` },
  { top: '2.5mm', left: '62mm', label: `Pcs: ${data.count}` },
  { top: '2.5mm', left: '54mm', label: `வட்டி: ${data.interest}%` },
  { top: '2.5mm', left: '46mm', label: `பொருள்: ${data.jewelName}` },
  { top: '2.5mm', left: '38mm', label: `Faults: ${data.faults}` },
  { top: '44mm', left: '70mm', label: `பெயர்: ${data.name}` },
  { top: '44mm', left: '62mm', label: `தொகை: ₹${data.amount}/-` },
  { top: '44mm', left: '54mm', label: `எடை: ${data.weight}g` },
  { top: '100.5mm', left: '85mm', label: ` ${data.phone},${data.whatsapp}` },
];

export default NoticePrint;
