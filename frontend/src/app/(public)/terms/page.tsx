import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 md:p-10 border border-neutral-border shadow-xs font-gujarati space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary border-b border-gray-200 pb-4">
        નિયમો અને શરતો (Terms and Conditions)
      </h1>

      <div className="prose max-w-none text-neutral-text leading-relaxed space-y-4 text-sm md:text-base">
        <p>
          BN NEWS ગુજરાતી પોર્ટલનો ઉપયોગ કરીને, તમે નીચેની શરતોનું પાલન કરવા સંમત થાઓ છો.
        </p>

        <h3 className="text-lg font-bold text-primary">કૉપિરાઇટ અને સામગ્રીનો ઉપયોગ</h3>
        <p>
          આ વેબસાઇટ પર પ્રકાશિત તમામ સમાચારો, લેખો, છબીઓ અને ગ્રાફિક્સ BN NEWS ગુજરાતી અથવા તેના માન્યતા પ્રાપ્ત સ્ત્રોતોની મિલકત છે. પૂર્વ લેખિત પરવાનગી વિના કોઈપણ સામગ્રીની અનધિકૃત નકલ અથવા પુનઃપ્રકાશન સખત પ્રતિબંધિત છે.
        </p>

        <h3 className="text-lg font-bold text-primary">અસ્વીકરણ (Disclaimer)</h3>
        <p>
          અમે તમામ સમાચાર તથ્યપૂર્ણ રાખવા સતત પ્રયત્નશીલ છીએ. RSS સ્ત્રોતો મારફતે મળતી બાહ્ય માહિતી સંદર્ભ માટે મૂળ સ્ત્રોતનું એટ્રિબ્યુશન આપવામાં આવે છે.
        </p>
      </div>
    </div>
  );
}
