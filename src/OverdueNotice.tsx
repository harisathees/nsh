import React from 'react';
import './OverdueNotice.css'; // Or your correct CSS file path

// --- MODIFIED --- Added 'validity_months' to the props
interface NoticeProps {
  name: string;
  address: string;
  phone: string;
  date: string;
  jewelName: string;
  count: number;
  itemNo: string;
  itemDate: string;
  amount: string;
  validity_months: number; // New prop
}

const OverdueNotice = React.forwardRef<HTMLDivElement, NoticeProps>((props, ref) => {
  const { name, address, phone, date, jewelName, count, itemNo, itemDate, amount, validity_months } = props;

  return (
    <div ref={ref} className="notice-letter">
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
        {/* --- MODIFIED --- Replaced the hardcoded '6' with the dynamic prop */}
        தாங்கள் அடியிற்கண்ட நம்பர்களில் அடகு வைத்திருக்கும் பொருள்களுக்கு {validity_months} மாதம் கடந்து விட்டபடியால் . இந்த நோட்டீஸ் கிடைத்த 10 நாட்களுக்குள் வட்டியை செலுத்தி அடகு ரசீதை புதுப்பித்துக் கொள்ள வேண்டியது. என்பதை இதன் மூலமாக தெரிவித்துக்கொள்கிறோம்.அப்படி 
        நீங்கள் வட்டி கட்ட வராதப்பட்சத்தில் 1/2 பைசா வட்டி கூடுதலாக வசூலிக்கப்படும் என்பதை இதன் மூலமாகவும் தெரிவித்துக் கொள்கின்றோம்.
      </p><br /><br />

      <p>
        <b>Ref:</b><br />
        அடகு நம்பர் &nbsp; &nbsp; &nbsp; &nbsp; : &nbsp;{itemNo}<br />
        பொருளின் விபரம் &nbsp; : {jewelName}<br />
        எண்ணிக்கை &nbsp; &nbsp; &nbsp; &nbsp; : {count} <br />
        அடகு தேதி &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : {itemDate}<br />
        கடன் தொகை &nbsp; &nbsp; &nbsp; &nbsp;: ₹{amount}/-
      </p>

      <div style={{ textAlign: 'right', marginTop: '2rem' }}>
        <b>NSH Gold Finance</b><br />
        <div style={{ marginTop: '3rem' }}>Authorized Signatory</div>
      </div>

      <p style={{ fontSize: '0.9rem', marginTop: '10rem' }}>
        (குறிப்பு:நீங்கள் வரும் போது இந்த நோட்டீஸ் கட்டாயமாக&nbsp;கொண்டு&nbsp;வரவும்.)
      </p>
    </div>
  );
});

export default OverdueNotice;