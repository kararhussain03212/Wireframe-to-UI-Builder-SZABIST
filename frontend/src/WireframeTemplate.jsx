import React from 'react';

const ResponsiveWireframe = () => {
  return (
    <>
      {/* MOBILE view (375×667) */}
      <div className="block md:hidden">
        <div className="relative bg-white text-gray-800 mx-auto" style={{ width: '100%', maxWidth: '375px', aspectRatio: '375 / 667' }}>
          <nav className="rounded-md p-3 flex justify-around " style={{"position":"absolute","left":"0.00%","top":"0.08%","width":"98.93%","height":"13.94%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827","backgroundColor":"#1f2937"}}>
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">about</a>
            <a href="#" className="hover:underline">Services</a>
          </nav>
          <div className="overflow-hidden " style={{"position":"absolute","left":"11.47%","top":"21.94%","width":"75.36%","height":"11.84%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}}>
            <img src="https://picsum.photos/300/200" alt="image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <p className="" style={{"position":"absolute","left":"6.41%","top":"37.33%","width":"50.11%","height":"13.64%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}}>But I must Eopleuin how</p>
          <input className="p-2 border rounded " style={{"position":"absolute","left":"64.53%","top":"38.13%","width":"34.94%","height":"5.76%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}} placeholder="Enter text..." />
          <input className="p-2 border rounded " style={{"position":"absolute","left":"65.38%","top":"44.63%","width":"32.02%","height":"5.34%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}} placeholder="Enter text..." />
          <div className="flex items-center gap-2 " style={{"position":"absolute","left":"65.87%","top":"51.48%","width":"14.01%","height":"4.65%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}}>
            <input type="radio" className="w-4 h-4" />
            <span>Option</span>
          </div>
          <h2 className="font-bold " style={{"position":"absolute","left":"12.85%","top":"53.77%","width":"45.19%","height":"5.30%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}}>#lorem Ipsum</h2>
          <button className="text-white hover:opacity-90 " style={{"position":"absolute","left":"17.02%","top":"59.50%","width":"40.80%","height":"5.16%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827","backgroundColor":"#3b82f6"}}>Click Me</button>
          <div className="overflow-hidden " style={{"position":"absolute","left":"9.40%","top":"70.38%","width":"81.33%","height":"10.39%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827"}}>
            <img src="https://picsum.photos/300/200" alt="image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <footer className="p-3 text-center " style={{"position":"absolute","left":"0.00%","top":"89.36%","width":"98.67%","height":"10.34%","fontFamily":"'Inter', sans-serif","fontSize":"16px","borderRadius":"4px","color":"#111827","backgroundColor":"#1f2937"}}>Footer Content</footer>
        </div>
      </div>

    </>
  );
};

export default ResponsiveWireframe;
