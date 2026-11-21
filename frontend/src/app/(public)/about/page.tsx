import React from 'react';
import BrandLogo from '../../../components/common/BrandLogo';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 md:p-10 border border-neutral-border shadow-xs font-gujarati space-y-6">
      <div className="text-center pb-6 border-b border-gray-200">
        <BrandLogo size="lg" className="mx-auto" />
        <h1 className="text-2xl font-bold text-primary mt-4">અમારા વિશે (About BN NEWS ગુજરાતી)</h1>
      </div>

      <div className="prose max-w-none text-neutral-text leading-relaxed space-y-4">
        <p>
          <strong>BN NEWS ગુજરાતી</strong> એ ગુજરાતનું એક અત્યાધુનિક અને વિશ્વસનીય ડિજિટલ ન્યૂઝ પ્લેટફોર્મ છે. અમારો ઉદ્દેશ્ય છે: <em>&ldquo;તમારા વિસ્તારની, તમારા ભાષામાં...&rdquo;</em> દરેક મહત્વના સમાચાર વાચકો સુધી સૌથી પહેલા અને સત્યતા સાથે પહોંચાડવા.
        </p>

        <h3 className="text-xl font-bold text-primary">અમારી પ્રતિબદ્ધતા</h3>
        <p>
          અમે નિષ્પક્ષ, ઝડપી અને તથ્યપૂર્ણ પત્રકારત્વમાં માનીએ છીએ. ગુજરાતના ખૂણે-ખૂણેથી લઈને દેશ અને દુનિયાના રાજકારણ, વ્યાપાર, ખેલ-જગત, મનોરંજન અને ટેકનોલોજીના તમામ સમાચારો અમારા વાચકોને એક જ ક્લિક પર ઉપલબ્ધ થાય છે.
        </p>

        <h3 className="text-xl font-bold text-primary">સંપર્ક સરનામું</h3>
        <p>
          BN મીડિયા નેટવર્ક પ્રાઇવેટ લિમિટેડ<br />
          BN મીડિયા સેન્ટર, એસ.જી. હાઇવે, અમદાવાદ, ગુજરાત - 380054<br />
          ઈમેલ: contact@bnnews.in | ફોન: +91 79 2658 0000
        </p>
      </div>
    </div>
  );
}
