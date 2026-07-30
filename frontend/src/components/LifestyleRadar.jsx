import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const LifestyleRadar = ({ currentUser, matchUser }) => {
  // Map our 1-5 scale to labels
  const data = [
    {
      subject: 'Sleep (Early->Late)',
      User: currentUser?.lifestyle?.sleepSchedule || 3,
      Match: matchUser?.lifestyle?.sleepSchedule || 3,
      fullMark: 5,
    },
    {
      subject: 'Cleanliness',
      User: currentUser?.lifestyle?.cleanliness || 3,
      Match: matchUser?.lifestyle?.cleanliness || 3,
      fullMark: 5,
    },
    {
      subject: 'Social (Intro->Extro)',
      User: currentUser?.lifestyle?.socialHabits || 3,
      Match: matchUser?.lifestyle?.socialHabits || 3,
      fullMark: 5,
    },
    {
      subject: 'Smoking',
      User: currentUser?.lifestyle?.smoking ? 5 : 1,
      Match: matchUser?.lifestyle?.smoking ? 5 : 1,
      fullMark: 5,
    },
    {
      subject: 'Dietary (Veg->NonVeg)',
      // Rough numerical mapping for chart visualization
      User: mapDietaryToNumber(currentUser?.lifestyle?.dietaryPref),
      Match: mapDietaryToNumber(matchUser?.lifestyle?.dietaryPref),
      fullMark: 5,
    },
  ];

  function mapDietaryToNumber(diet) {
    switch (diet) {
      case 'Vegan': return 1;
      case 'Vegetarian': return 2;
      case 'Eggitarian': return 3;
      case 'Flexible': return 4;
      case 'Non-Vegetarian': return 5;
      default: return 3;
    }
  }

  return (
    <div className="w-full h-64 bg-white rounded-lg p-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="You"
            dataKey="User"
            stroke="#0f172a"
            fill="#0f172a"
            fillOpacity={0.5}
          />
          <Radar
            name={matchUser?.name || 'Match'}
            dataKey="Match"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.5}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LifestyleRadar;
