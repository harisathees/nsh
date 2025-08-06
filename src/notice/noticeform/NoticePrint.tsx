// import React, { useEffect, useState, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { createClient } from '@supabase/supabase-js';
// import bg1 from '../../assets/front.jpg';
// import bg2 from '../../assets/back.jpg';

// // ✅ Setup Supabase Client
// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL!,
//   import.meta.env.VITE_SUPABASE_ANON_KEY!
// );

// const NoticePrint = () => {
//   const { loanId } = useParams();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const frontRef = useRef<HTMLDivElement>(null);
//   const backRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!loanId) return;

//       const { data: loan, error: loanError } = await supabase
//         .from('loans')
//         .select('*')
//         .eq('id', loanId)
//         .single();

//       if (loanError) {
//         console.error('Loan fetch error:', loanError);
//         return;
//       }

//       const { data: customer, error: custError } = await supabase
//         .from('customers')
//         .select('*')
//         .eq('id', loan.customer_id)
//         .single();

//       const { data: jewel, error: jewelError } = await supabase
//         .from('jewels')
//         .select('*')
//         .eq('loan_id', loanId)
//         .maybeSingle();

//       if (custError || jewelError) {
//         console.error('Fetch error:', custError || jewelError);
//         return;
//       }

//       setData({
//         name: customer.name,
//         address: customer.address,
//         phone: customer.mobile_no,
//         date: loan.date,
//         jewelName: jewel?.type || 'N/A',
//         count: jewel?.pieces || 1,
//         itemNo: loan.loan_no,
//         itemDate: loan.date,
//         amount: loan.amount,
//       });

//       setLoading(false);
//     };

//     fetchData();
//   }, [loanId]);

//   const handlePrint = (ref: React.RefObject<HTMLDivElement>) => {
//     const printContents = ref.current?.innerHTML;
//     const win = window.open('', '', 'height=800,width=600');
//     if (win && printContents) {
//       win.document.write('<html><head><title>Print</title>');
//       win.document.write(`
//         <style>
//           @media print {
//             * {
//               -webkit-print-color-adjust: exact !important;
//               print-color-adjust: exact !important;
//             }
//             body {
//               margin: 0;
//               padding: 0;
//             }
//             img {
//               max-width: 100%;
//             }
//           }
//         </style>
//       </head><body>`);
//       win.document.write(printContents);
//       win.document.write('</body></html>');
//       win.document.close();
//       win.focus();
//       win.print();
//     }
//   };

//   if (loading || !data) return <p>Loading...</p>;

//   return (
//     <>
//       {/* Print Buttons */}
//       <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
//         <button
//           onClick={() => handlePrint(frontRef)}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#007BFF',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             fontWeight: 'bold',
//           }}
//         >
//           🖨️ Print Front Page
//         </button>

//         <button
//           onClick={() => handlePrint(backRef)}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#28A745',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             fontWeight: 'bold',
//           }}
//         >
//           🖨️ Print Back Page
//         </button>
//       </div>

//       {/* Front Page */}
//       <div
//         ref={frontRef}
//         style={{
//           position: 'relative',
//           width: '210mm',
//           height: '297mm',
//           margin: '0 auto',
//           backgroundColor: '#fff',
//           overflow: 'hidden',
//         }}
//       >
//         <img
//           src={bg1}
//           alt="front"
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '210mm',
//             height: '297mm',
//             zIndex: 0,
//           }}
//         />
//         {[
//           { top: '117.5mm', left: '197mm', label: `Date:${data.date}` },
//           { top: '117.5mm', left: '190mm', label: `Due:${data.date}` },
//           { top: '2.5mm', left: '198mm', label: `Gold:${data.itemNo}` },
//           { top: '2.5mm', left: '193mm', label: `Silver:${data.itemNo}` },
//           { top: '2.5mm', left: '180mm', label: `கடன் எண்:${data.itemNo}` },
//           { top: '2.5mm', left: '172mm', label: `Pcs: ${data.count}` },
//           { top: '2.5mm', left: '164mm', label: `வட்டி: ${data.count}%` },
//           { top: '2.5mm', left: '156mm', label: `பொருள்: ${data.jewelName}` },
//           { top: '2.5mm', left: '148mm', label: `முகவரி: ${data.address}` },
//           { top: '39mm', left: '180mm', label: `பெயர்: ${data.name}` },
//           { top: '39mm', left: '172mm', label: `தொகை: ₹${data.amount}/-` },
//           { top: '39mm', left: '164mm', label: `எடை: ${data.count}g` },
//           { top: '117.5mm', left: '97mm', label: `Date:${data.date}` },
//           { top: '117.5mm', left: '90mm', label: `Due:${data.date}` },
//           { top: '2.5mm', left: '70mm', label: `கடன் எண்:${data.itemNo}` },
//           { top: '2.5mm', left: '62mm', label: `Pcs: ${data.count}` },
//           { top: '2.5mm', left: '54mm', label: `வட்டி: ${data.count}%` },
//           { top: '2.5mm', left: '46mm', label: `பொருள்: ${data.jewelName}` },
//           { top: '39mm', left: '70mm', label: `பெயர்: ${data.name}` },
//           { top: '39mm', left: '62mm', label: `தொகை: ₹${data.amount}/-` },
//           { top: '39mm', left: '54mm', label: `எடை: ${data.count}g` },
//         ].map((field, index) => (
//           <div
//             key={index}
//             style={{
//               position: 'absolute',
//               top: field.top,
//               left: field.left,
//               transform: 'rotate(90deg)',
//               transformOrigin: 'left top',
//               fontSize: '14px',
//               zIndex: 1,
//             }}
//           >
//             <b>{field.label}</b>
//           </div>
//         ))}
//       </div>

//       {/* Back Page */}
//       <div
//         ref={backRef}
//         style={{
//           width: '210mm',
//           height: '297mm',
//           margin: '0 auto',
//           pageBreakBefore: 'always',
//           overflow: 'hidden',
//         }}
//       >
//         <img
//           src={bg2}
//           alt="back"
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//           }}
//         />
//       </div>
//     </>
//   );
// };

// export default NoticePrint;


import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import bg1 from '../../assets/front.jpg';
import bg2 from '../../assets/back.jpg';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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

      // Images
      const customerImageUrl = customer?.photo_url || null;
      const jewelImageUrl = jewel?.image_url || null;


      // Get fallback rates if missing
      const { goldRate, silverRate } = await fetchLatestRates();

      setData({
        name: customer?.name,
        address: customer?.address,
        phone: customer?.mobile_no,
        date: loan.date,
        duedate: loan.duedate,
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

  const handlePrint = (ref: React.RefObject<HTMLDivElement>) => {
    const printContents = ref.current?.innerHTML;
    const win = window.open('', '', 'height=800,width=600');
    if (win && printContents) {
      win.document.write('<html><head><title>Print</title>');
      win.document.write(`
        <style>
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
            img {
              max-width: 100%;
            }
          }
        </style>
      </head><body>`);
      win.document.write(printContents);
      win.document.write('</body></html>');
      win.document.close();
      win.focus();
      win.print();
    }
  };

  if (loading || !data) return <p>Loading...</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
        <button onClick={() => handlePrint(frontRef)} style={buttonStyle('#007BFF')}>🖨️ Print Front Page</button>
        <button onClick={() => handlePrint(backRef)} style={buttonStyle('#28A745')}>🖨️ Print Back Page</button>
      </div>

      {/* Front */}
      <div
        ref={frontRef}
        style={{ position: 'relative', width: '210mm', height: '297mm', margin: '0 auto', overflow: 'hidden' }}
      >
        <img src={bg1} alt="front" style={{ position: 'absolute', width: '210mm', height: '297mm' }} />

        {/*of Customer Image - Rotated via wrapping container */}
        {data.customerImage && (
          <div
            style={{
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
            }}
          >
            <img
              src={data.customerImage}
              alt="Customer"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        {/*of Jewel Image - Rotated via wrapping container */}
        {data.jewelImage && (
          <div
            style={{
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
            }}
          >
            <img
              src={data.jewelImage}
              alt="Jewel"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}
        {/*cc Customer Image - Rotated via wrapping container */}
        {data.customerImage && (
          <div
            style={{
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
            }}
          >
            <img
              src={data.customerImage}
              alt="Customer"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        {/*cc Jewel Image - Rotated via wrapping container */}
        {data.jewelImage && (
          <div
            style={{
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
            }}
          >
            <img
              src={data.jewelImage}
              alt="Jewel"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}



        {fields(data).map((field, index) => (
          <div
            key={index}
            style={{
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
              maxWidth: '80mm'
            }}
          >
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

const imageOverlayStyle = (left: string) => ({
  position: 'absolute',
  top: '50mm',
  left,
  width: '40mm',
  height: '30mm',
  border: '2px solid black',
  objectFit: 'cover',
  zIndex: 2,
  transform: 'rotate(90deg)',
  transformOrigin: 'left top',
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
  { top: '2.5mm', left: '70mm', label: `கடன் எண்:${data.itemNo}` },
  { top: '2.5mm', left: '62mm', label: `Pcs: ${data.count}` },
  { top: '2.5mm', left: '54mm', label: `வட்டி: ${data.interest}%` },
  { top: '2.5mm', left: '46mm', label: `பொருள்: ${data.jewelName}` },
  { top: '44mm', left: '70mm', label: `பெயர்: ${data.name}` },
  { top: '44mm', left: '62mm', label: `தொகை: ₹${data.amount}/-` },
  { top: '44mm', left: '54mm', label: `எடை: ${data.weight}g` },
];

export default NoticePrint;
