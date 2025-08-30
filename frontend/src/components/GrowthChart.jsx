import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GrowthChart = ({ records, infantDob }) => {
  // Helper function for precise age calculation
  const getAgeInMonths = (recordDateStr) => {
    const dob = new Date(infantDob);
    const recordDate = new Date(recordDateStr);
    // Calculate age in days and convert to months for precision
    const ageInDays = (recordDate.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24);
    return parseFloat((ageInDays / 30.4375).toFixed(2)); // Average days in a month
  };

  // Find the maximum age to set the range for our ideal trend line
  const maxAge = records.reduce((max, rec) => Math.max(max, getAgeInMonths(rec.record_date)), 0);

  // Create a dataset for the infant's actual recorded data
  const actualData = records.map(rec => ({
    age: getAgeInMonths(rec.record_date),
    weight: rec.weight_kg,
    height: rec.height_cm,
  })).sort((a, b) => a.age - b.age);

  // Create a separate, smooth dataset for the ideal trend line
  const idealData = [];
  for (let age = 0; age <= Math.ceil(maxAge) + 1; age++) {
    idealData.push({
      age: age,
      idealWeight: parseFloat((3.5 + (age * 0.7)).toFixed(2)),
      idealHeight: parseFloat((50.0 + (age * 2.0)).toFixed(2)),
    });
  }

  // Create a dataset for the weight-for-height chart
  const dataByHeight = actualData.map(rec => ({
    height: rec.height,
    weight: rec.weight
  })).sort((a, b) => a.height - b.height);

  return (
    <div className="charts-grid">
      {/* Chart 1: Weight-for-Age */}
      <div className="chart-wrapper">
        <h3>Weight-for-Age</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" type="number" domain={[0, 'dataMax + 1']} label={{ value: 'Age (Months)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {/* Reference Line */}
            <Line data={idealData} type="monotone" dataKey="idealWeight" name="Median Trend" stroke="#28a745" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            {/* Actual Data */}
            <Line data={actualData} type="monotone" dataKey="weight" name="Infant's Weight" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Height-for-Age */}
      <div className="chart-wrapper">
        <h3>Height-for-Age</h3>
        <ResponsiveContainer width="100%" height={300}>
           <LineChart margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" type="number" domain={[0, 'dataMax + 1']} label={{ value: 'Age (Months)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
             {/* Reference Line */}
            <Line data={idealData} type="monotone" dataKey="idealHeight" name="Median Trend" stroke="#28a745" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            {/* Actual Data */}
            <Line data={actualData} type="monotone" dataKey="height" name="Infant's Height" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Weight-for-Height */}
      <div className="chart-wrapper">
         <h3>Weight-for-Height</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataByHeight} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="height" type="number" domain={['dataMin - 5', 'dataMax + 5']} label={{ value: 'Height (cm)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="weight" name="Weight" stroke="#ffc658" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthChart;