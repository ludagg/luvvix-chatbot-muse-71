
import React, { useState } from 'react';
import { ArrowLeft, Delete } from 'lucide-react';

interface MobileCalculatorProps {
  onBack: () => void;
}

const MobileCalculator = ({ onBack }: MobileCalculatorProps) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '*': return firstValue * secondValue;
      case '/': return firstValue / secondValue;
      case '=': return secondValue;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const Button = ({ onPress, title, color = "bg-gray-200", textColor = "text-black" }: any) => (
    <button
      onClick={onPress}
      className={`${color} ${textColor} rounded-lg text-xl font-medium h-16 flex items-center justify-center active:scale-95 transition-transform`}
    >
      {title}
    </button>
  );

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <button onClick={onBack} className="p-2 text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">Calculatrice</h1>
        <div className="w-10" />
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-end justify-end p-6 bg-black">
          <div className="text-right">
            <div className="text-white text-5xl font-light">{display}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 p-4 bg-gray-900">
          <Button onPress={clear} title="C" color="bg-gray-600" textColor="text-white" />
          <Button onPress={() => {}} title="±" color="bg-gray-600" textColor="text-white" />
          <Button onPress={() => {}} title="%" color="bg-gray-600" textColor="text-white" />
          <Button onPress={() => inputOperation('/')} title="÷" color="bg-orange-500" textColor="text-white" />

          <Button onPress={() => inputNumber('7')} title="7" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputNumber('8')} title="8" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputNumber('9')} title="9" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputOperation('*')} title="×" color="bg-orange-500" textColor="text-white" />

          <Button onPress={() => inputNumber('4')} title="4" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputNumber('5')} title="5" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputNumber('6')} title="6" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputOperation('-')} title="−" color="bg-orange-500" textColor="text-white" />

          <Button onPress={() => inputNumber('1')} title="1" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputNumber('2')} title="2" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputNumber('3')} title="3" color="bg-gray-700" textColor="text-white" />
          <Button onPress={() => inputOperation('+')} title="+" color="bg-orange-500" textColor="text-white" />

          <div className="col-span-2">
            <Button onPress={() => inputNumber('0')} title="0" color="bg-gray-700" textColor="text-white" />
          </div>
          <Button onPress={() => inputNumber('.')} title="." color="bg-gray-700" textColor="text-white" />
          <Button onPress={performCalculation} title="=" color="bg-orange-500" textColor="text-white" />
        </div>
      </div>
    </div>
  );
};

export default MobileCalculator;
