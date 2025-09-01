// src/components/AnnualNotice.tsx

import React from 'react';


// Define the props to be consistent with the data we have
interface AnnualNoticeProps {
  name: string;
  address: string;
  phone: string;
  date: string;
  jewelName: string;
  count: number;
  itemNo: string;
  itemDate: string;
  amount: string;
  validity_months: number;
}

// Use React.forwardRef to allow the parent component to get a ref to the DOM element
const AnnualNotice = React.forwardRef<HTMLDivElement, AnnualNoticeProps>((props, ref) => {
  const { name, address, phone, date, jewelName, count, itemNo, itemDate, amount } = props;

  return (
    // The ref from the parent is passed to this div
    <div ref={ref} className="p-10 bg-white text-black font-serif">
      <div className="a4-content">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">NSH Gold Finance</h1>
          <p className="text-sm">227/E/1, Meenavar Sangam, Theresapuram</p>
          <p className="text-sm">Phone: 9600332834</p>
        </header>

        <h2 className="text-xl font-bold text-center my-6 underline">ஆண்டு புதுப்பித்தல் அறிவிப்பு</h2>
        
        <div className="text-right mb-6">
          <p>Date: {date}</p>
        </div>

        <div className="mb-6">
          <p>To,</p>
          <p className="font-bold">{name}</p>
          <p>{address}</p>
          <p>{phone}</p>
        </div>

        <h3 className="text-lg font-semibold mb-4">அன்புடையீர்,</h3>

        <p className="mb-4 leading-relaxed">
          தாங்கள் எங்கள் நிறுவனத்தில் அடகு வைத்துள்ள கீழ்கண்ட தங்க நகையின் காலம் ஓராண்டு நிறைவடைவதை தங்களுக்கு நினைவூட்ட விரும்புகிறோம்.
        </p>
        <p className="leading-relaxed">
          எனவே, இந்த அறிவிப்பு கிடைத்த ஒரு வாரத்திற்குள், உரிய வட்டித் தொகையைச் செலுத்தி நகையை புதுப்பித்துக் கொள்ளுமாறு அன்புடன் கேட்டுக்கொள்கிறோம். தாங்கள் இந்த வாய்ப்பை பயன்படுத்தி தங்கள் நகையை புதுப்பித்து தொடர்ந்து பயனடையுமாறு வேண்டுகிறோம்.
        </p>

        <div className="my-8 p-4 border border-dashed border-gray-400">
          <h4 className="font-bold text-center mb-4">நகையின் விபரம்</h4>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="pr-4 py-1">அடகு நம்பர்</td>
                <td className="font-mono">: {itemNo}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1">பொருளின் விபரம்</td>
                <td>: {jewelName}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1">எண்ணிக்கை</td>
                <td>: {count}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1">அடகு தேதி</td>
                <td>: {itemDate}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 font-bold">கடன் தொகை</td>
                <td className="font-bold">: ₹{amount}/-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-16 text-right">
          <p className="font-semibold">NSH Gold Finance</p>
          <p className="mt-16 border-t border-gray-400 pt-2 inline-block">Authorized Signatory</p>
        </div>

        <p className="text-xs text-center mt-8">
          (குறிப்பு: நீங்கள் வரும் போது இந்த நோட்டீஸ் கட்டாயமாக கொண்டு வரவும்.)
        </p>
      </div>
    </div>
  );
});

export default AnnualNotice;