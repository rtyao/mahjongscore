import { Metadata } from 'next';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: 'Hand Calculator — Mahjong Score',
  description: 'Calculate the score for any Filipino-Chinese Mahjong hand. Enter your tiles, see the full breakdown.',
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
