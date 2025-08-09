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
        date: formatDate(loan.date),
        duedate: formatDate(loan.duedate),
        weight: jewel?.net_weight,
        interest: loan?.interest_rate,
        jewelName: jewel?.description || 'N/A',
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

  const handleShare = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    try {
      if (!ref.current) return;
      const dataUrl = await htmlToImage.toPng(ref.current, { quality: 1 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Loan Notice',
          text: 'Please find the notice attached',
        });
      } else {
        alert('Sharing not supported on this device/browser');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading print notice...</p>
        </div>
      </div>
    );
  }
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
            top: '119mm',
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
            fontSize: '14px',
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
  { top: '117.5mm', left: '197mm', label: `Date:${data.date}` },
  { top: '117.5mm', left: '190mm', label: `Due:${data.duedate}` },
  { top: '2.5mm', left: '198mm', label: `Gold:${data.goldRate}` },
  { top: '2.5mm', left: '193mm', label: `Silver:${data.silverRate}` },
  { top: '2.5mm', left: '180mm', label: `கடன் எண்:${data.itemNo}` },
  { top: '2.5mm', left: '172mm', label: `தரம்:${data.quality}` },
  { top: '2.5mm', left: '165mm', label: `Pcs: ${data.count}` },
  { top: '2.5mm', left: '158mm', label: `வட்டி: ${data.interest}%` },
  { top: '2.5mm', left: '150mm', label: `பொருள்: ${data.jewelName}` },
  { top: '2.5mm', left: '143mm', label: `முகவரி: ${data.address}` },
  { top: '44mm', left: '180mm', label: `பெயர்: ${data.name}` },
  { top: '44mm', left: '172mm', label: `தொகை: ₹${data.amount}/-` },
  { top: '44mm', left: '164mm', label: `எடை: ${data.weight}g` },
  { top: '117.5mm', left: '97mm', label: `Date:${data.date}` },
  { top: '117.5mm', left: '90mm', label: `Due:${data.duedate}` },
  { top: '2.5mm', left: '90mm', label: `Rate/g: ₹${(data.weight > 0 ? (data.amount / data.weight).toFixed(2) : '0.0')}` },
  { top: '2.5mm', left: '70mm', label: `கடன் எண்:${data.itemNo}` },
  { top: '2.5mm', left: '62mm', label: `Pcs: ${data.count}` },
  { top: '2.5mm', left: '54mm', label: `வட்டி: ${data.interest}%` },
  { top: '2.5mm', left: '46mm', label: `பொருள்: ${data.jewelName}` },
  { top: '44mm', left: '70mm', label: `பெயர்: ${data.name}` },
  { top: '44mm', left: '62mm', label: `தொகை: ₹${data.amount}/-` },
  { top: '44mm', left: '54mm', label: `எடை: ${data.weight}g` },
];

export default NoticePrint;
