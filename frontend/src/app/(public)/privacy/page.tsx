import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 md:p-10 border border-neutral-border shadow-xs font-gujarati space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary border-b border-gray-200 pb-4">
        ગોપનીયતા નીતિ (Privacy Policy)
      </h1>

      <div className="prose max-w-none text-neutral-text leading-relaxed space-y-4 text-sm md:text-base">
        <p>
          BN NEWS ગુજરાતી (&ldquo;અમે&rdquo;, &ldquo;અમારું&rdquo;) વાચકોની અંગત ગોપનીયતાનું સંપૂર્ણ સન્માન કરે છે. આ ગોપનીયતા નીતિ સમજાવે છે કે અમે તમારી માહિતી કેવી રીતે એકત્રિત, ઉપયોગ અને સુરક્ષિત કરીએ છીએ.
        </p>

        <h3 className="text-lg font-bold text-primary">1. માહિતી સંગ્રહ</h3>
        <p>
          જ્યારે તમે અમારી વેબસાઇટની મુલાકાત લો છો, ત્યારે અમે કૂકીઝ અને પ્રમાણભૂત વિશ્લેષણ સાધનો દ્વારા બ્રાઉઝિંગ અનુભવને સુધારવા માટે બિન-વ્યક્તિગત માહિતી મેળવી શકીએ છીએ.
        </p>

        <h3 className="text-lg font-bold text-primary">2. સુરક્ષા</h3>
        <p>
          અમે તમારી માહિતીને સુરક્ષિત રાખવા માટે આધુનિક એન્ક્રિપ્શન અને વ્યાવસાયિક સુરક્ષા ધોરણોનું પાલન કરીએ છીએ.
        </p>

        <h3 className="text-lg font-bold text-primary">3. સંપર્ક</h3>
        <p>
          કોઈપણ પ્રશ્ન માટે કૃપા કરીને privacy@bnnews.in પર સંપર્ક કરો.
        </p>
      </div>
    </div>
  );
}
