import React, { useRef } from 'react';
import './NoticePrint.css';
const NoticePrint = ({
  name,
  address,
  phone,
  date,
  jewelName,
  count,
  itemNo,
  itemDate,
  amount,
}: {
  name: string;
  address: string;
  phone: string;
  date: string;
  jewelName: string;
  count: number;
  itemNo: string;
  itemDate: string;
  amount: string;
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    const win = window.open('', '', 'height=800,width=600');
    if (win && printContents) {
      win.document.write('<html><head><title>Print</title>');
      win.document.write('<style>body { font-family: Arial; padding: 2rem; }</style>');
      win.document.write('</head><body>');
      win.document.write(printContents);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  return (
    <>
      <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs mb-4">
        🖨️ Print Notice
      </button>
      <div ref={printRef} className="notice-letter">
        <div>
          <b>NSH Gold Finance</b><br />
          227/E/1,<br /> Meenavar sangam,<br /> Theresapuram,<br />
          9600332834
        </div>

        <h2 style={{ textAlign: 'center', marginTop: '1rem' }}><b>நோட்டீஸ்</b></h2>
        <div style={{ textAlign: 'right' }}>Date: {date}</div>

        <p>To,<br />
          <b>{name}</b><br />
          <b>{address}</b><br />
          <b>{phone}</b>
        </p>
        <br /><br />
        <h1>அன்புடையீர்,</h1><br />

        <p>
          தாங்கள் அடியிற்கண்ட நம்பர்களில் அடகு வைத்திருக்கும் பொருள்களுக்கு 6 மாதம் கடந்து விட்டபடியால் . இந்த நோட்டீஸ் கிடைத்த 10 நாட்களுக்குள் வட்டியை செலுத்தி அடகு ரசீதை புதுப்பித்துக் கொள்ள வேண்டியது. என்பதை இதன் மூலமாக தெரிவித்துக்கொள்கிறோம்.அப்படி 
          நீங்கள் வட்டி கட்ட வராதப்பட்சத்தில் 1/2 பைசா வட்டி கூடுதலாக வசூலிக்கப்படும் என்பதை இதன் மூலமாகவும் தெரிவித்துக் கொள்கின்றோம்.
        </p><br /><br />

        <p>
          <b>Ref:</b><br />
          அடகு நம்பர்         :  {itemNo}<br />
          பொருளின் விபரம்   : {jewelName}<br />
          எண்ணிக்கை	        : {count} <br />
          அடகு தேதி           : {itemDate}<br />
          கடன் தொகை        : ₹{amount}/-
        </p>

        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
          <b>NSH Gold Finance</b><br />
          <div style={{ marginTop: '3rem' }}>Authorized Signatory</div>
        </div>

        <p style={{ fontSize: '0.9rem', marginTop: '2rem' }}>
          (குறிப்பு:நீங்கள் வரும் போது இந்த நோட்டீஸ் கட்டாயமாக கொண்டு வரவும்.)
        </p>
      </div>
    </>
  );
};

export default NoticePrint;