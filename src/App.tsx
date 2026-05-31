/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { History } from './pages/History';
import { db } from './db';
import { auth } from './firebase';
import type { Medicine } from './types';

export default function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthInitialized(true);
      if (user) {
        // Seed data when successful login occurs
        const seedData = async () => {
          try {
            console.log("Checking medicine count...");
            const count = await db.medicines.count();
            console.log("Medicine count:", count);
            if (count !== 50) {
              console.log("Found", count, "medicines; clearing and reseeding...");
              await db.medicines.clear();
              const mockMeds: Medicine[] = [
  { id: "1", name: "Paracetamol 500", generic_name: "Paracetamol", category: "Antipyretics & Analgesics", manufacturer: "Sun Pharma", batch_number: "PCM101", mrp: 30, purchase_price: 18, selling_price: 28, stock_quantity: 120, expiry_date: "2027-08-12", supplier: "MediSupply" },
  { id: "2", name: "Crocin Advance", generic_name: "Paracetamol", category: "Antipyretics & Analgesics", manufacturer: "GSK", batch_number: "CRC202", mrp: 35, purchase_price: 22, selling_price: 33, stock_quantity: 90, expiry_date: "2027-05-18", supplier: "HealthCare Distributors" },
  { id: "3", name: "Dolo 650", generic_name: "Paracetamol", category: "Antipyretics & Analgesics", manufacturer: "Micro Labs", batch_number: "DL650", mrp: 34, purchase_price: 20, selling_price: 32, stock_quantity: 150, expiry_date: "2028-01-10", supplier: "MediSupply" },
  { id: "4", name: "Azithral 500", generic_name: "Azithromycin", category: "Antibiotics", manufacturer: "Alembic", batch_number: "AZ500", mrp: 110, purchase_price: 82, selling_price: 105, stock_quantity: 45, expiry_date: "2027-09-20", supplier: "PharmaLink" },
  { id: "5", name: "Amoxyclav 625", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotics", manufacturer: "Abbott", batch_number: "AMX625", mrp: 220, purchase_price: 170, selling_price: 210, stock_quantity: 60, expiry_date: "2027-11-11", supplier: "HealthCare Distributors" },
  { id: "6", name: "Ciplox 500", generic_name: "Ciprofloxacin", category: "Antibiotics", manufacturer: "Cipla", batch_number: "CPX500", mrp: 95, purchase_price: 68, selling_price: 90, stock_quantity: 70, expiry_date: "2027-06-15", supplier: "MediSupply" },
  { id: "7", name: "Benadryl Syrup", generic_name: "Diphenhydramine", category: "Cough & Cold Medicines", manufacturer: "Johnson & Johnson", batch_number: "BND001", mrp: 120, purchase_price: 90, selling_price: 115, stock_quantity: 40, expiry_date: "2027-10-08", supplier: "Care Pharma" },
  { id: "8", name: "Alex Syrup", generic_name: "Dextromethorphan", category: "Cough & Cold Medicines", manufacturer: "Glenmark", batch_number: "ALX009", mrp: 145, purchase_price: 110, selling_price: 138, stock_quantity: 35, expiry_date: "2028-02-14", supplier: "Care Pharma" },
  { id: "9", name: "Ascoril LS", generic_name: "Ambroxol + Levosalbutamol", category: "Cough & Cold Medicines", manufacturer: "Glenmark", batch_number: "ASC123", mrp: 135, purchase_price: 102, selling_price: 130, stock_quantity: 55, expiry_date: "2027-12-19", supplier: "HealthCare Distributors" },
  { id: "10", name: "Pantocid 40", generic_name: "Pantoprazole", category: "Gastrointestinal Medicines", manufacturer: "Sun Pharma", batch_number: "PNT040", mrp: 145, purchase_price: 108, selling_price: 138, stock_quantity: 100, expiry_date: "2027-09-30", supplier: "MediSupply" },
  { id: "11", name: "Digene Gel", generic_name: "Antacid", category: "Gastrointestinal Medicines", manufacturer: "Abbott", batch_number: "DGN222", mrp: 120, purchase_price: 92, selling_price: 115, stock_quantity: 65, expiry_date: "2027-08-11", supplier: "Care Pharma" },
  { id: "12", name: "ENO Fruit Salt", generic_name: "Sodium Bicarbonate", category: "Gastrointestinal Medicines", manufacturer: "GSK", batch_number: "ENO111", mrp: 90, purchase_price: 65, selling_price: 85, stock_quantity: 110, expiry_date: "2028-01-25", supplier: "PharmaLink" },
  { id: "13", name: "Glycomet 500", generic_name: "Metformin", category: "Diabetes Medicines", manufacturer: "USV", batch_number: "GLY500", mrp: 75, purchase_price: 52, selling_price: 70, stock_quantity: 85, expiry_date: "2027-06-06", supplier: "MediSupply" },
  { id: "14", name: "Gluconorm G2", generic_name: "Metformin + Glimepiride", category: "Diabetes Medicines", manufacturer: "Lupin", batch_number: "GLU200", mrp: 140, purchase_price: 100, selling_price: 132, stock_quantity: 50, expiry_date: "2027-11-17", supplier: "HealthCare Distributors" },
  { id: "15", name: "Istamet XR", generic_name: "Sitagliptin + Metformin", category: "Diabetes Medicines", manufacturer: "Sun Pharma", batch_number: "IST009", mrp: 220, purchase_price: 180, selling_price: 210, stock_quantity: 38, expiry_date: "2027-10-05", supplier: "PharmaLink" },
  { id: "16", name: "Telma 40", generic_name: "Telmisartan", category: "Hypertension & Cardiac", manufacturer: "Glenmark", batch_number: "TEL040", mrp: 160, purchase_price: 122, selling_price: 150, stock_quantity: 60, expiry_date: "2028-03-12", supplier: "Care Pharma" },
  { id: "17", name: "Amlong 5", generic_name: "Amlodipine", category: "Hypertension & Cardiac", manufacturer: "Micro Labs", batch_number: "AML005", mrp: 55, purchase_price: 38, selling_price: 50, stock_quantity: 95, expiry_date: "2027-07-29", supplier: "MediSupply" },
  { id: "18", name: "Ecosprin 75", generic_name: "Aspirin", category: "Hypertension & Cardiac", manufacturer: "USV", batch_number: "ECO075", mrp: 25, purchase_price: 15, selling_price: 22, stock_quantity: 130, expiry_date: "2028-01-08", supplier: "HealthCare Distributors" },
  { id: "19", name: "Asthalin Inhaler", generic_name: "Salbutamol", category: "Asthma & Respiratory", manufacturer: "Cipla", batch_number: "AST010", mrp: 180, purchase_price: 145, selling_price: 170, stock_quantity: 40, expiry_date: "2027-09-14", supplier: "PharmaLink" },
  { id: "20", name: "Budecort Inhaler", generic_name: "Budesonide", category: "Asthma & Respiratory", manufacturer: "Cipla", batch_number: "BDC222", mrp: 320, purchase_price: 270, selling_price: 305, stock_quantity: 25, expiry_date: "2027-12-01", supplier: "Care Pharma" },
  { id: "21", name: "Thyronorm 50", generic_name: "Levothyroxine", category: "Thyroid Medicines", manufacturer: "Abbott", batch_number: "THY050", mrp: 140, purchase_price: 105, selling_price: 132, stock_quantity: 58, expiry_date: "2027-08-20", supplier: "HealthCare Distributors" },
  { id: "22", name: "Eltroxin 100", generic_name: "Levothyroxine", category: "Thyroid Medicines", manufacturer: "GSK", batch_number: "ELT100", mrp: 170, purchase_price: 128, selling_price: 160, stock_quantity: 42, expiry_date: "2027-11-28", supplier: "MediSupply" },
  { id: "23", name: "Shelcal 500", generic_name: "Calcium + Vitamin D3", category: "Vitamins & Supplements", manufacturer: "Torrent", batch_number: "SHL500", mrp: 125, purchase_price: 92, selling_price: 118, stock_quantity: 90, expiry_date: "2028-02-10", supplier: "Care Pharma" },
  { id: "24", name: "Revital H", generic_name: "Multivitamin", category: "Vitamins & Supplements", manufacturer: "Sun Pharma", batch_number: "REV009", mrp: 340, purchase_price: 275, selling_price: 325, stock_quantity: 48, expiry_date: "2027-12-18", supplier: "HealthCare Distributors" },
  { id: "25", name: "Zincovit", generic_name: "Multivitamin", category: "Vitamins & Supplements", manufacturer: "Apex", batch_number: "ZNC333", mrp: 110, purchase_price: 80, selling_price: 102, stock_quantity: 75, expiry_date: "2027-10-09", supplier: "PharmaLink" },
  { id: "26", name: "Candid Cream", generic_name: "Clotrimazole", category: "Dermatology / Skin", manufacturer: "Glenmark", batch_number: "CAN001", mrp: 95, purchase_price: 68, selling_price: 88, stock_quantity: 50, expiry_date: "2027-09-02", supplier: "Care Pharma" },
  { id: "27", name: "Betnovate Cream", generic_name: "Betamethasone", category: "Dermatology / Skin", manufacturer: "GSK", batch_number: "BTN202", mrp: 75, purchase_price: 50, selling_price: 70, stock_quantity: 45, expiry_date: "2027-11-30", supplier: "HealthCare Distributors" },
  { id: "28", name: "Moov Spray", generic_name: "Pain Relief Spray", category: "Antipyretics & Analgesics", manufacturer: "Paras Pharma", batch_number: "MOV009", mrp: 210, purchase_price: 165, selling_price: 198, stock_quantity: 35, expiry_date: "2028-01-15", supplier: "MediSupply" },
  { id: "29", name: "Volini Gel", generic_name: "Diclofenac Gel", category: "Antipyretics & Analgesics", manufacturer: "Sun Pharma", batch_number: "VOL333", mrp: 160, purchase_price: 122, selling_price: 150, stock_quantity: 62, expiry_date: "2027-07-22", supplier: "PharmaLink" },
  { id: "30", name: "Combiflam", generic_name: "Ibuprofen + Paracetamol", category: "Antipyretics & Analgesics", manufacturer: "Sanofi", batch_number: "CBF101", mrp: 42, purchase_price: 26, selling_price: 38, stock_quantity: 115, expiry_date: "2027-08-17", supplier: "HealthCare Distributors" },
  { id: "31", name: "Montek LC", generic_name: "Montelukast + Levocetirizine", category: "Asthma & Respiratory", manufacturer: "Sun Pharma", batch_number: "MON222", mrp: 180, purchase_price: 142, selling_price: 170, stock_quantity: 44, expiry_date: "2027-10-13", supplier: "Care Pharma" },
  { id: "32", name: "Cetcip Tablet", generic_name: "Cetirizine", category: "Cough & Cold Medicines", manufacturer: "Cipla", batch_number: "CET010", mrp: 32, purchase_price: 20, selling_price: 28, stock_quantity: 125, expiry_date: "2027-09-27", supplier: "MediSupply" },
  { id: "33", name: "Omez 20", generic_name: "Omeprazole", category: "Gastrointestinal Medicines", manufacturer: "Dr Reddy's", batch_number: "OMZ020", mrp: 88, purchase_price: 62, selling_price: 82, stock_quantity: 78, expiry_date: "2028-01-03", supplier: "PharmaLink" },
  { id: "34", name: "ORS Powder", generic_name: "Oral Rehydration Salts", category: "Gastrointestinal Medicines", manufacturer: "Electral", batch_number: "ORS100", mrp: 22, purchase_price: 12, selling_price: 18, stock_quantity: 180, expiry_date: "2027-06-19", supplier: "Care Pharma" },
  { id: "35", name: "Augmentin 625", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotics", manufacturer: "GSK", batch_number: "AUG625", mrp: 240, purchase_price: 190, selling_price: 230, stock_quantity: 32, expiry_date: "2027-12-22", supplier: "HealthCare Distributors" },
  { id: "36", name: "Liv 52", generic_name: "Herbal Liver Tonic", category: "Vitamins & Supplements", manufacturer: "Himalaya", batch_number: "LIV520", mrp: 140, purchase_price: 105, selling_price: 132, stock_quantity: 55, expiry_date: "2028-02-20", supplier: "MediSupply" },
  { id: "37", name: "Becosules", generic_name: "Vitamin B Complex", category: "Vitamins & Supplements", manufacturer: "Pfizer", batch_number: "BEC009", mrp: 48, purchase_price: 30, selling_price: 42, stock_quantity: 95, expiry_date: "2027-11-09", supplier: "PharmaLink" },
  { id: "38", name: "Neurobion Forte", generic_name: "Vitamin B Complex", category: "Vitamins & Supplements", manufacturer: "Merck", batch_number: "NBF777", mrp: 42, purchase_price: 25, selling_price: 38, stock_quantity: 102, expiry_date: "2027-09-05", supplier: "Care Pharma" },
  { id: "39", name: "Clavam 625", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotics", manufacturer: "Alkem", batch_number: "CLV625", mrp: 215, purchase_price: 172, selling_price: 205, stock_quantity: 40, expiry_date: "2027-08-14", supplier: "HealthCare Distributors" },
  { id: "40", name: "Telmikind AM", generic_name: "Telmisartan + Amlodipine", category: "Hypertension & Cardiac", manufacturer: "Mankind", batch_number: "TKAM01", mrp: 165, purchase_price: 125, selling_price: 155, stock_quantity: 47, expiry_date: "2027-10-29", supplier: "MediSupply" },
  { id: "41", name: "Gaviscon Syrup", generic_name: "Antacid Syrup", category: "Gastrointestinal Medicines", manufacturer: "Reckitt", batch_number: "GAV101", mrp: 180, purchase_price: 145, selling_price: 172, stock_quantity: 39, expiry_date: "2028-01-12", supplier: "PharmaLink" },
  { id: "42", name: "Deriphyllin", generic_name: "Etophylline + Theophylline", category: "Asthma & Respiratory", manufacturer: "Zydus", batch_number: "DRP202", mrp: 75, purchase_price: 52, selling_price: 68, stock_quantity: 64, expiry_date: "2027-07-15", supplier: "Care Pharma" },
  { id: "43", name: "TusQ Syrup", generic_name: "Cough Syrup", category: "Cough & Cold Medicines", manufacturer: "Zuventus", batch_number: "TSQ009", mrp: 145, purchase_price: 112, selling_price: 138, stock_quantity: 51, expiry_date: "2027-09-18", supplier: "HealthCare Distributors" },
  { id: "44", name: "Vicks Action 500", generic_name: "Paracetamol Combination", category: "Cough & Cold Medicines", manufacturer: "P&G", batch_number: "VCK500", mrp: 38, purchase_price: 24, selling_price: 34, stock_quantity: 98, expiry_date: "2027-11-02", supplier: "MediSupply" },
  { id: "45", name: "Atorva 10", generic_name: "Atorvastatin", category: "Hypertension & Cardiac", manufacturer: "Zydus", batch_number: "ATR010", mrp: 155, purchase_price: 118, selling_price: 148, stock_quantity: 52, expiry_date: "2028-02-08", supplier: "PharmaLink" },
  { id: "46", name: "Cobadex CZS", generic_name: "Multivitamin", category: "Vitamins & Supplements", manufacturer: "Pfizer", batch_number: "CBD101", mrp: 98, purchase_price: 70, selling_price: 90, stock_quantity: 84, expiry_date: "2027-10-21", supplier: "Care Pharma" },
  { id: "47", name: "Panderm Cream", generic_name: "Clobetasol Combination", category: "Dermatology / Skin", manufacturer: "Mankind", batch_number: "PDM009", mrp: 92, purchase_price: 64, selling_price: 85, stock_quantity: 43, expiry_date: "2027-08-26", supplier: "HealthCare Distributors" },
  { id: "48", name: "Luliconazole Cream", generic_name: "Luliconazole", category: "Dermatology / Skin", manufacturer: "Sun Pharma", batch_number: "LUL888", mrp: 210, purchase_price: 170, selling_price: 198, stock_quantity: 28, expiry_date: "2027-12-10", supplier: "MediSupply" },
  { id: "49", name: "Sinarest Tablet", generic_name: "Paracetamol Combination", category: "Cough & Cold Medicines", manufacturer: "Centaur", batch_number: "SNR123", mrp: 48, purchase_price: 32, selling_price: 44, stock_quantity: 87, expiry_date: "2027-09-07", supplier: "Care Pharma" },
  { id: "50", name: "Calpol 650", generic_name: "Paracetamol", category: "Antipyretics & Analgesics", manufacturer: "GSK", batch_number: "CLP650", mrp: 36, purchase_price: 22, selling_price: 32, stock_quantity: 140, expiry_date: "2028-01-18", supplier: "HealthCare Distributors" },
];
              await db.medicines.bulkAdd(mockMeds);
            }
          } catch (e) {
            console.error('Data seed error:', e);
          }
        };
        seedData();
      }
    });

    return () => unsubscribe();
  }, []);

  if (!authInitialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="pos" element={<POS />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
