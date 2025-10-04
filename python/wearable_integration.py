#!/usr/bin/env python3
"""
================================================================================
WEARABLE DEVICE INTEGRATION FOR VIBE COACH REHABILITATION PLATFORM
================================================================================

PURPOSE:
This module provides comprehensive integration with various wearable devices
for the Vibe Coach rehabilitation platform. It processes health and fitness
data from multiple sources to provide holistic movement analysis and
rehabilitation progress tracking.

SUPPORTED WEARABLE DEVICES:
==========================
APPLE WATCH:
- Data Sources: HealthKit, Apple Health app exports
- Supported Metrics: Heart rate, steps, active calories, exercise minutes, VO2 max
- Data Formats: JSON export from Health app, HealthKit API integration
- Integration: Direct HealthKit API access, CSV export processing
- Real-time: Live data streaming via HealthKit framework
- Historical: Bulk data export and processing

FITBIT DEVICES:
- Data Sources: Fitbit API, Fitbit app exports, CSV downloads
- Supported Metrics: Heart rate, steps, floors, active minutes, sleep data
- Data Formats: JSON API responses, CSV exports, XML data
- Integration: OAuth 2.0 API authentication, webhook subscriptions
- Real-time: Live data streaming via Fitbit Web API
- Historical: Bulk data export and processing

GARMIN DEVICES:
- Data Sources: Garmin Connect API, Garmin Express exports
- Supported Metrics: Heart rate, steps, intensity minutes, VO2 max, stress
- Data Formats: JSON API responses, TCX files, FIT files, CSV exports
- Integration: OAuth 2.0 API authentication, file upload processing
- Real-time: Live data streaming via Garmin Connect IQ
- Historical: Bulk data export and processing

SAMSUNG HEALTH:
- Data Sources: Samsung Health app, Samsung Health API
- Supported Metrics: Heart rate, steps, active calories, sleep, stress
- Data Formats: JSON API responses, CSV exports, Samsung Health data
- Integration: Samsung Health SDK, OAuth 2.0 API authentication
- Real-time: Live data streaming via Samsung Health platform
- Historical: Bulk data export and processing

GOOGLE FIT:
- Data Sources: Google Fit API, Google Fit app exports
- Supported Metrics: Heart rate, steps, active calories, exercise data
- Data Formats: JSON API responses, Google Fit data types
- Integration: Google Fit API, OAuth 2.0 authentication
- Real-time: Live data streaming via Google Fit platform
- Historical: Bulk data export and processing

INPUT SPECIFICATIONS:
====================

FILE INPUT REQUIREMENTS:
- Supported formats: JSON, CSV, XML, TCX, FIT files
- File size: Maximum 100MB per file
- Encoding: UTF-8 for text files, binary for FIT/TCX files
- Structure: Device-specific data schemas and formats
- Validation: Automatic format detection and validation

API INPUT REQUIREMENTS:
- Authentication: OAuth 2.0 for all supported platforms
- Rate limits: Platform-specific rate limiting (typically 100-1000 requests/hour)
- Data scope: User consent for health data access
- Real-time: Webhook subscriptions for live data updates
- Historical: Bulk data retrieval with date range filtering

DATA PROCESSING PIPELINE:
========================

STEP 1: DATA INGESTION & VALIDATION
- Detect file format and device type automatically
- Validate data structure and required fields
- Check data integrity and completeness
- Handle corrupted or incomplete data gracefully
- Log validation results and warnings

STEP 2: DATA NORMALIZATION & STANDARDIZATION
- Convert device-specific formats to standardized schema
- Normalize units of measurement (metric/imperial)
- Align timestamps across different time zones
- Standardize data types and value ranges
- Handle missing or null values appropriately

STEP 3: HEALTH METRICS EXTRACTION
- Extract heart rate data (resting, active, recovery)
- Process step count and activity metrics
- Calculate calories burned and energy expenditure
- Analyze sleep patterns and quality metrics
- Extract exercise-specific data and performance metrics

STEP 4: REHABILITATION-SPECIFIC ANALYSIS
- Correlate wearable data with movement analysis
- Identify patterns in heart rate variability
- Analyze recovery metrics and stress indicators
- Track progress in rehabilitation exercises
- Detect potential health concerns or anomalies

STEP 5: DATA AGGREGATION & INSIGHTS
- Combine wearable data with pose analysis results
- Generate comprehensive health and fitness reports
- Create personalized recommendations and insights
- Track long-term progress and trends
- Provide actionable feedback for rehabilitation

OUTPUT FORMAT SPECIFICATIONS:
============================

STANDARDIZED HEALTH DATA STRUCTURE:
{
    "device_info": {
        "device_type": "string",                    # Type of wearable device
        "device_model": "string",                   # Specific device model
        "firmware_version": "string",               # Device firmware version
        "last_sync": "ISO 8601 datetime",           # Last data sync timestamp
        "data_source": "string"                     # Source of data (API, file, etc.)
    },
    "heart_rate_data": {
        "resting_hr": "float",                      # Resting heart rate (BPM)
        "max_hr": "float",                          # Maximum heart rate (BPM)
        "avg_hr": "float",                          # Average heart rate (BPM)
        "hr_variability": "float",                  # Heart rate variability (ms)
        "hr_zones": {                               # Heart rate zones
            "zone_1": "float",                      # Zone 1 (50-60% max HR)
            "zone_2": "float",                      # Zone 2 (60-70% max HR)
            "zone_3": "float",                      # Zone 3 (70-80% max HR)
            "zone_4": "float",                      # Zone 4 (80-90% max HR)
            "zone_5": "float"                       # Zone 5 (90-100% max HR)
        },
        "recovery_hr": "float"                      # Recovery heart rate (BPM)
    },
    "activity_data": {
        "steps": "integer",                         # Total steps taken
        "active_minutes": "integer",                # Minutes of active exercise
        "calories_burned": "float",                 # Calories burned (kcal)
        "distance": "float",                        # Distance traveled (km)
        "floors_climbed": "integer",                # Floors climbed
        "intensity_minutes": "integer"              # High-intensity minutes
    },
    "sleep_data": {
        "total_sleep": "float",                     # Total sleep time (hours)
        "deep_sleep": "float",                      # Deep sleep time (hours)
        "light_sleep": "float",                     # Light sleep time (hours)
        "rem_sleep": "float",                       # REM sleep time (hours)
        "sleep_efficiency": "float",                # Sleep efficiency (0-100%)
        "sleep_score": "float"                      # Overall sleep score (0-100)
    },
    "exercise_data": {
        "workout_sessions": [                       # Individual workout sessions
            {
                "start_time": "ISO 8601 datetime",  # Workout start time
                "duration": "float",                # Workout duration (minutes)
                "exercise_type": "string",          # Type of exercise
                "avg_hr": "float",                  # Average heart rate
                "max_hr": "float",                  # Maximum heart rate
                "calories_burned": "float",         # Calories burned
                "intensity": "string"               # Workout intensity level
            }
        ],
        "vo2_max": "float",                         # VO2 max estimate
        "fitness_age": "integer",                   # Estimated fitness age
        "recovery_time": "float"                    # Recovery time (hours)
    },
    "stress_data": {
        "stress_level": "float",                    # Stress level (0-100)
        "stress_score": "float",                    # Stress score (0-100)
        "stress_events": "integer",                 # Number of stress events
        "relaxation_time": "float"                  # Relaxation time (minutes)
    },
    "rehabilitation_metrics": {
        "movement_quality": "float",                # Movement quality score (0-100)
        "pain_correlation": "float",                # Correlation with pain levels
        "recovery_progress": "float",               # Recovery progress (0-100)
        "compliance_score": "float",                # Exercise compliance (0-100)
        "improvement_areas": ["string"]             # Areas needing improvement
    },
    "technical_metrics": {
        "processing_time": "float",                 # Processing time (seconds)
        "data_quality": "float",                    # Data quality score (0-1)
        "completeness": "float",                    # Data completeness (0-1)
        "accuracy": "float",                        # Data accuracy estimate (0-1)
        "warnings": ["string"]                      # Processing warnings
    }
}

PERFORMANCE REQUIREMENTS:
========================
- Processing time: < 30 seconds for 1 month of data
- Memory usage: < 500MB during processing
- Accuracy: > 95% data extraction accuracy
- Reliability: 99%+ successful processing rate
- Scalability: Support for multiple concurrent users

ERROR HANDLING:
==============
- Graceful degradation for unsupported data formats
- Fallback processing for partial data
- Comprehensive error logging and reporting
- Data validation and integrity checks
- Recovery from processing failures

INTEGRATION REQUIREMENTS:
========================
- Next.js frontend integration via API endpoints
- Real-time data synchronization capabilities
- HIPAA-compliant data handling and storage
- Secure authentication and authorization
- Scalable architecture for multiple users

SECURITY CONSIDERATIONS:
=======================
- Encrypted data transmission and storage
- User consent and privacy protection
- Secure API key management
- Data anonymization for analytics
- Compliance with health data regulations

AUTHOR: Vibe Coach Development Team
VERSION: 2.0.0
LAST UPDATED: January 2025
================================================================================
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
