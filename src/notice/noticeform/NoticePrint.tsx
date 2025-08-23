import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import * as htmlToImage from 'html-to-image'; // <-- Added
import bg1 from '../../assets/front.jpg';
import bg2 from '../../assets/back.jpg';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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

const handleShare = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
  try {
    if (!ref.current) return;

    // Define a scale factor for high-resolution output
    const scale = 3; // Increase for higher quality (300 DPI from 96 DPI is ~3.1)

    const dataUrl = await htmlToImage.toPng(ref.current, {
      quality: 1, // Quality for PNG is about compression, not resolution
      
      // --- MODIFIED ---
      // Use pixelRatio to render at a higher resolution
      pixelRatio: scale, 

      // This helps ensure external images are re-fetched and not missed
      cacheBust: true, 
    });

    if (isMobile && navigator.canShare) {
      // Mobile share logic (remains the same)
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      await navigator.share({
        files: [file],
        title: "Loan Notice",
        text: "Please find the notice attached",
      });
    } else {
      // Desktop print logic (remains the same)
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
              window.onload = function() {
                window.print();
              };
              window.onafterprint = function() {
                parent.document.body.removeChild(parent.document.querySelector("#print-frame"));
              };
            </script>
          </body>
          </html>
        `);
        doc.close();
      }
    }
  } catch (error) {
    console.error("Error handling share/print:", error);
  }
};



  if (loading || !data) return <p>Loading...</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
        <button onClick={() => handleShare(frontRef, 'notice-front.png')} style={buttonStyle('#007BFF')}>📤 Share Front Page</button>
        <button onClick={() => handleShare(backRef, 'notice-back.png')} style={buttonStyle('#28A745')}>📤 Share Back Page</button>
      </div>

      {/* Front */}
      <div
        ref={frontRef}
        style={{ position: 'relative', width: '210mm', height: '297mm', margin: '0 auto', overflow: 'hidden' }}
      >
        <img src={bg1} alt="front" style={{ position: 'absolute', width: '210mm', height: '297mm' }} />
        {data.customerImage && (
          <div style={{
            position: 'absolute',
            top: '90mm',
            left: '64mm',
            width: '26mm',
            height: '33mm',
            transform: 'rotate(90deg)',
            transformOrigin: 'left top',
            overflow: 'hidden',
            border: '2px solid black',
            zIndex: 1,
          }}>
            <img src={data.customerImage} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {data.jewelImage && (
          <div style={{
            position: 'absolute',
            top: '120mm',
            left: '179mm',
            width: '26mm',
            height: '33mm',
            transform: 'rotate(90deg)',
            transformOrigin: 'left top',
            overflow: 'hidden',
            border: '2px solid black',
            zIndex: 1,
          }}>
            <img src={data.jewelImage} alt="Jewel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {data.customerImage && (
          <div style={{
            position: 'absolute',
            top: '91mm',
            left: '179mm',
            width: '26mm',
            height: '33mm',
            transform: 'rotate(90deg)',
            transformOrigin: 'left top',
            overflow: 'hidden',
            border: '2px solid black',
            zIndex: 1,
          }}>
            <img src={data.customerImage} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {data.jewelImage && (
          <div style={{
            position: 'absolute',
            top: '119mm',
            left: '64mm',
            width: '26mm',
            height: '33mm',
            transform: 'rotate(90deg)',
            transformOrigin: 'left top',
            overflow: 'hidden',
            border: '2px solid black',
            zIndex: 1,
          }}>
            <img src={data.jewelImage} alt="Jewel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {fields(data).map((field, index) => (
          <div key={index} style={{
            position: 'absolute',
            top: field.top,
            left: field.left,
            transform: 'rotate(90deg)',
            transformOrigin: 'left top',
            fontSize: '15px',
            zIndex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150mm'
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

const buttonStyle = (bg: string) => ({
  padding: '10px 20px',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
});



const fields = (data: any) => [
  //of
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

  //cc
  
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
  { top: '44mm', left: '46mm', label: ` ${data.phone},${data.whatsapp}` },

];

export default NoticePrint;
