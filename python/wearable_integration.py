#!/usr/bin/env python3
"""
Wearable Device Integration for Vibe Coach
Supports Apple Watch, Fitbit, Garmin, and other fitness trackers
"""

import json
import csv
import os
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import argparse

class WearableDataProcessor:
    def __init__(self):
        self.supported_devices = {
            'apple_watch': ['HealthKit', 'Apple Health'],
            'fitbit': ['Fitbit API', 'Fitbit CSV'],
            'garmin': ['Garmin Connect', 'Garmin CSV'],
            'samsung': ['Samsung Health', 'Samsung CSV'],
            'google_fit': ['Google Fit API', 'Google Fit CSV']
        }
        
    def process_health_data(self, file_path: str, device_type: str) -> Dict[str, Any]:
        """
        Process health data from various wearable devices
        
        Args:
            file_path: Path to the health data file
            device_type: Type of device (apple_watch, fitbit, garmin, etc.)
            
        Returns:
            Processed health data dictionary
        """
        try:
            if device_type == 'apple_watch':
                return self._process_apple_health(file_path)
            elif device_type == 'fitbit':
                return self._process_fitbit_data(file_path)
            elif device_type == 'garmin':
                return self._process_garmin_data(file_path)
            elif device_type == 'samsung':
                return self._process_samsung_health(file_path)
            elif device_type == 'google_fit':
                return self._process_google_fit(file_path)
            else:
                raise ValueError(f"Unsupported device type: {device_type}")
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': None
            }
    
    def _process_apple_health(self, file_path: str) -> Dict[str, Any]:
        """Process Apple Health data (JSON export)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract relevant health metrics
            health_data = {
                'device_type': 'apple_watch',
                'export_date': data.get('ExportDate', ''),
                'metrics': {}
            }
            
            # Process different health data types
            for record in data.get('data', []):
                metric_type = record.get('type', '')
                value = record.get('value', 0)
                unit = record.get('unit', '')
                date = record.get('date', '')
                
                if metric_type not in health_data['metrics']:
                    health_data['metrics'][metric_type] = []
                
                health_data['metrics'][metric_type].append({
                    'value': value,
                    'unit': unit,
                    'date': date
                })
            
            # Calculate daily averages and trends
            daily_stats = self._calculate_daily_stats(health_data['metrics'])
            health_data['daily_stats'] = daily_stats
            
            return {
                'success': True,
                'data': health_data,
                'summary': self._generate_summary(health_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Error processing Apple Health data: {str(e)}",
                'data': None
            }
    
    def _process_fitbit_data(self, file_path: str) -> Dict[str, Any]:
        """Process Fitbit data (CSV export)"""
        try:
            health_data = {
                'device_type': 'fitbit',
                'metrics': {},
                'daily_stats': {}
            }
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    date = row.get('Date', '')
                    
                    # Process different metrics
                    for key, value in row.items():
                        if key == 'Date':
                            continue
                            
                        if key not in health_data['metrics']:
                            health_data['metrics'][key] = []
                        
                        try:
                            numeric_value = float(value) if value else 0
                            health_data['metrics'][key].append({
                                'value': numeric_value,
                                'date': date
                            })
                        except ValueError:
                            continue
            
            # Calculate daily stats
            health_data['daily_stats'] = self._calculate_daily_stats(health_data['metrics'])
            
            return {
                'success': True,
                'data': health_data,
                'summary': self._generate_summary(health_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Error processing Fitbit data: {str(e)}",
                'data': None
            }
    
    def _process_garmin_data(self, file_path: str) -> Dict[str, Any]:
        """Process Garmin data (CSV export)"""
        try:
            health_data = {
                'device_type': 'garmin',
                'metrics': {},
                'daily_stats': {}
            }
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    date = row.get('Date', '')
                    
                    # Map Garmin columns to standard metrics
                    metric_mapping = {
                        'Steps': 'steps',
                        'Distance': 'distance',
                        'Calories': 'calories_burned',
                        'Active Minutes': 'active_minutes',
                        'Heart Rate': 'heart_rate',
                        'Sleep': 'sleep_duration'
                    }
                    
                    for garmin_key, standard_key in metric_mapping.items():
                        if garmin_key in row and row[garmin_key]:
                            if standard_key not in health_data['metrics']:
                                health_data['metrics'][standard_key] = []
                            
                            try:
                                value = float(row[garmin_key])
                                health_data['metrics'][standard_key].append({
                                    'value': value,
                                    'date': date
                                })
                            except ValueError:
                                continue
            
            health_data['daily_stats'] = self._calculate_daily_stats(health_data['metrics'])
            
            return {
                'success': True,
                'data': health_data,
                'summary': self._generate_summary(health_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Error processing Garmin data: {str(e)}",
                'data': None
            }
    
    def _process_samsung_health(self, file_path: str) -> Dict[str, Any]:
        """Process Samsung Health data"""
        # Similar implementation to other devices
        return self._process_generic_csv(file_path, 'samsung')
    
    def _process_google_fit(self, file_path: str) -> Dict[str, Any]:
        """Process Google Fit data"""
        # Similar implementation to other devices
        return self._process_generic_csv(file_path, 'google_fit')
    
    def _process_generic_csv(self, file_path: str, device_type: str) -> Dict[str, Any]:
        """Generic CSV processing for unknown formats"""
        try:
            health_data = {
                'device_type': device_type,
                'metrics': {},
                'daily_stats': {}
            }
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    date = row.get('Date', '')
                    
                    for key, value in row.items():
                        if key == 'Date' or not value:
                            continue
                            
                        if key not in health_data['metrics']:
                            health_data['metrics'][key] = []
                        
                        try:
                            numeric_value = float(value)
                            health_data['metrics'][key].append({
                                'value': numeric_value,
                                'date': date
                            })
                        except ValueError:
                            continue
            
            health_data['daily_stats'] = self._calculate_daily_stats(health_data['metrics'])
            
            return {
                'success': True,
                'data': health_data,
                'summary': self._generate_summary(health_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Error processing {device_type} data: {str(e)}",
                'data': None
            }
    
    def _calculate_daily_stats(self, metrics: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Calculate daily statistics from metrics"""
        daily_stats = {}
        
        for metric_name, records in metrics.items():
            if not records:
                continue
                
            values = [r['value'] for r in records if isinstance(r['value'], (int, float))]
            
            if not values:
                continue
            
            daily_stats[metric_name] = {
                'total': sum(values),
                'average': sum(values) / len(values),
                'min': min(values),
                'max': max(values),
                'count': len(values),
                'trend': self._calculate_trend(values)
            }
        
        return daily_stats
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction from values"""
        if len(values) < 2:
            return 'stable'
        
        # Simple trend calculation
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)
        
        if second_avg > first_avg * 1.1:
            return 'increasing'
        elif second_avg < first_avg * 0.9:
            return 'decreasing'
        else:
            return 'stable'
    
    def _generate_summary(self, health_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a summary of health data"""
        summary = {
            'device_type': health_data['device_type'],
            'total_metrics': len(health_data['metrics']),
            'data_points': sum(len(records) for records in health_data['metrics'].values()),
            'date_range': self._get_date_range(health_data['metrics']),
            'key_insights': []
        }
        
        # Generate insights based on available data
        daily_stats = health_data.get('daily_stats', {})
        
        if 'steps' in daily_stats:
            avg_steps = daily_stats['steps']['average']
            if avg_steps >= 10000:
                summary['key_insights'].append(f"Great step count! Average {avg_steps:.0f} steps per day")
            elif avg_steps >= 5000:
                summary['key_insights'].append(f"Good step count: {avg_steps:.0f} steps per day. Try to reach 10,000!")
            else:
                summary['key_insights'].append(f"Step count could be improved: {avg_steps:.0f} steps per day")
        
        if 'calories_burned' in daily_stats:
            avg_calories = daily_stats['calories_burned']['average']
            summary['key_insights'].append(f"Average daily calories burned: {avg_calories:.0f}")
        
        if 'heart_rate' in daily_stats:
            avg_hr = daily_stats['heart_rate']['average']
            summary['key_insights'].append(f"Average heart rate: {avg_hr:.0f} BPM")
        
        if 'sleep_duration' in daily_stats:
            avg_sleep = daily_stats['sleep_duration']['average']
            if avg_sleep >= 7:
                summary['key_insights'].append(f"Good sleep duration: {avg_sleep:.1f} hours")
            else:
                summary['key_insights'].append(f"Sleep could be improved: {avg_sleep:.1f} hours (aim for 7-9 hours)")
        
        return summary
    
    def _get_date_range(self, metrics: Dict[str, List[Dict]]) -> Dict[str, str]:
        """Get the date range of the data"""
        all_dates = []
        for records in metrics.values():
            for record in records:
                if 'date' in record:
                    all_dates.append(record['date'])
        
        if not all_dates:
            return {'start': 'Unknown', 'end': 'Unknown'}
        
        all_dates.sort()
        return {
            'start': all_dates[0],
            'end': all_dates[-1]
        }
    
    def generate_workout_recommendations(self, health_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate workout recommendations based on health data"""
        recommendations = {
            'fitness_level': 'beginner',
            'recommended_workouts': [],
            'weekly_plan': {},
            'goals': []
        }
        
        daily_stats = health_data.get('daily_stats', {})
        
        # Analyze fitness level
        if 'steps' in daily_stats:
            avg_steps = daily_stats['steps']['average']
            if avg_steps >= 10000:
                recommendations['fitness_level'] = 'intermediate'
            elif avg_steps >= 15000:
                recommendations['fitness_level'] = 'advanced'
        
        # Generate workout recommendations
        if recommendations['fitness_level'] == 'beginner':
            recommendations['recommended_workouts'] = [
                'Morning Cardio',
                'Core & Stability',
                'Yoga Flow',
                'Evening Stretch'
            ]
        elif recommendations['fitness_level'] == 'intermediate':
            recommendations['recommended_workouts'] = [
                'Full Body Strength',
                'HIIT Cardio Blast',
                'Upper Body Focus',
                'Lower Body Power'
            ]
        else:
            recommendations['recommended_workouts'] = [
                'Strength Training',
                'Tabata Training',
                'Push Day',
                'Pull Day'
            ]
        
        # Generate weekly plan
        recommendations['weekly_plan'] = {
            'Monday': 'Upper Body Focus',
            'Tuesday': 'Cardio',
            'Wednesday': 'Lower Body Power',
            'Thursday': 'Core & Abs',
            'Friday': 'Full Body Strength',
            'Saturday': 'Flexibility & Mobility',
            'Sunday': 'Rest or Light Activity'
        }
        
        # Set goals based on data
        if 'steps' in daily_stats and daily_stats['steps']['average'] < 10000:
            recommendations['goals'].append('Increase daily steps to 10,000+')
        
        if 'calories_burned' in daily_stats:
            recommendations['goals'].append('Maintain or increase calorie burn')
        
        if 'sleep_duration' in daily_stats and daily_stats['sleep_duration']['average'] < 7:
            recommendations['goals'].append('Improve sleep quality and duration')
        
        return recommendations

def main():
    parser = argparse.ArgumentParser(description='Process wearable device data for Vibe Coach')
    parser.add_argument('file_path', help='Path to the health data file')
    parser.add_argument('device_type', help='Type of device (apple_watch, fitbit, garmin, samsung, google_fit)')
    parser.add_argument('--output', '-o', help='Output JSON file path (optional)')
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.file_path):
        print(f"Error: File not found: {args.file_path}")
        sys.exit(1)
    
    # Process the data
    processor = WearableDataProcessor()
    result = processor.process_health_data(args.file_path, args.device_type)
    
    if result['success']:
        print("✅ Health data processed successfully!")
        print(f"Device: {result['data']['device_type']}")
        print(f"Metrics: {result['data']['total_metrics']}")
        print(f"Data points: {result['data']['data_points']}")
        
        # Generate workout recommendations
        recommendations = processor.generate_workout_recommendations(result['data'])
        result['recommendations'] = recommendations
        
        # Save to file if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\nResults saved to: {args.output}")
        
        # Print summary
        print("\n📊 Key Insights:")
        for insight in result['summary']['key_insights']:
            print(f"  • {insight}")
        
        print("\n💪 Workout Recommendations:")
        for workout in recommendations['recommended_workouts']:
            print(f"  • {workout}")
            
    else:
        print(f"❌ Error processing data: {result['error']}")
        sys.exit(1)

if __name__ == "__main__":
    main()
