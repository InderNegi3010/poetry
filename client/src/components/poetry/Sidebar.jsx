import React from 'react';
import { Card, CardContent } from '../ui/card';

const QaafiyaCard = () => (
  <Card className="bg-[#fceee4] border-0 shadow-sm">
    <CardContent className="p-6 text-center">
      <h3 className="text-4xl font-serif text-[#c58c63]">Qaafiya</h3>
      <p className="text-sm font-serif text-[#c58c63] tracking-widest">DICTIONARY</p>
      <p className="mt-4 text-lg text-[#a27357]">Unlock the Melody of Urdu Poetry</p>
    </CardContent>
  </Card>
);

const DictionaryCard = () => (
  <Card className="bg-[#e9f4ff] border-0 shadow-sm">
    <CardContent className="p-6 text-center">
      <p className="text-xs text-gray-500">On its 8th Anniversary, Rekhta Foundation presents</p>
      <h3 className="text-2xl font-bold text-[#005a9c] mt-2">rekhta <span className="font-light">Dictionary</span></h3>
      <p className="mt-2 text-sm text-gray-700">A Trilingual Treasure of Urdu Words</p>
      <a href="#" className="text-xs text-[#005a9c] font-semibold mt-1 block">www.rekhtadictionary.com</a>
    </CardContent>
  </Card>
);

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-80 space-y-6">
      <QaafiyaCard />
      <DictionaryCard />
    </aside>
  );
}