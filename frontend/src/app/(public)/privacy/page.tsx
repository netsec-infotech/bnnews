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
          કોઈપણ પ્રશ્ન માટે કૃપા કરીને privacy@bnnewsgujarati.com અથવા info@bnnewsgujarati.com પર સંપર્ક કરો.
        </p>

        {/* Facebook / Meta User Data Deletion Instructions */}
        <div id="data-deletion" className="mt-8 pt-6 border-t border-gray-200 space-y-3">
          <h3 className="text-lg font-bold text-primary">
            4. ફેસબુક અને સોશિયલ ડેટા ડિલીશન સૂચનાઓ (Facebook Data Deletion Instructions)
          </h3>
          <p>
            BN NEWS ગુજરાતી ફેસબુક લૉગિન અને મેટા પ્લેટફોર્મ ડેટા સુરક્ષા નીતિઓનું ચુસ્ત પાલન કરે છે. જો તમે અમારી સિસ્ટમમાંથી તમારા ફેસબુક સંબંધિત વપરાશકર્તા ડેટાને ડિલીટ કરવા માંગતા હોવ, તો નીચેની સરળ પ્રક્રિયા અનુસરો:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            <li>
              તમારા Facebook એકાઉન્ટમાં <strong>Settings &amp; Privacy &gt; Settings</strong> પર જાઓ.
            </li>
            <li>
              ડાબી બાજુની પેનલમાંથી <strong>Apps and Websites</strong> વિકલ્પ પસંદ કરો.
            </li>
            <li>
              સૂચિમાંથી <strong>BN News Gujarati</strong> એપ્લિકેશન શોધો.
            </li>
            <li>
              <strong>Remove (દૂર કરો)</strong> બટન પર ક્લિક કરો.
            </li>
            <li>
              અથવા વૈકલ્પિક રીતે, તમે <strong>info@bnnewsgujarati.com</strong> પર તમારી ફેસબુક પ્રોફાઇલ વિગતો સાથે ઇમેઇલ મોકલીને પણ ડેટા ડિલીટ કરવાની વિનંતી કરી શકો છો. અમે ૪૮ કલાકની અંદર તમારી તમામ માહિતી સર્વર પરથી દૂર કરીશું.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
