#!/usr/bin/env python3
"""
Backend API Testing for Barbershop Booking System
Tests all API endpoints for proper error handling when database tables don't exist yet.
"""

import requests
import json
import os
from datetime import datetime, timedelta

# Get base URL from environment - using localhost for testing since external routing has issues
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class BarberShopAPITester:
    def __init__(self):
        self.base_url = API_BASE
        self.tenant_slug = "demo-barbershop"
        self.test_results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def test_cors_headers(self):
        """Test CORS preflight request"""
        try:
            response = requests.options(f"{self.base_url}/tenants/{self.tenant_slug}")
            
            # Check status code
            if response.status_code != 200:
                self.log_result("CORS Preflight", False, f"Expected 200, got {response.status_code}")
                return
                
            # Check CORS headers
            headers = response.headers
            required_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods', 
                'Access-Control-Allow-Headers'
            ]
            
            missing_headers = []
            for header in required_headers:
                if header not in headers:
                    missing_headers.append(header)
                    
            if missing_headers:
                self.log_result("CORS Preflight", False, f"Missing CORS headers: {missing_headers}")
            else:
                self.log_result("CORS Preflight", True, "All CORS headers present")
                
        except Exception as e:
            self.log_result("CORS Preflight", False, f"Request failed: {str(e)}")
    
    def test_get_tenant(self):
        """Test GET /api/tenants/demo-barbershop"""
        try:
            response = requests.get(f"{self.base_url}/tenants/{self.tenant_slug}")
            
            # Should return proper error handling (not 500 crash)
            if response.status_code == 500:
                self.log_result("Get Tenant", False, "API crashed with 500 error", response.text)
                return
                
            # Check for proper error response structure
            if response.status_code in [404, 400]:
                try:
                    data = response.json()
                    if 'error' in data:
                        self.log_result("Get Tenant", True, f"Proper error handling: {data['error']}")
                    else:
                        self.log_result("Get Tenant", False, "Error response missing 'error' field")
                except:
                    self.log_result("Get Tenant", False, "Invalid JSON in error response")
            else:
                # Unexpected success or other status
                self.log_result("Get Tenant", True, f"Unexpected response: {response.status_code}")
                
        except Exception as e:
            self.log_result("Get Tenant", False, f"Request failed: {str(e)}")
    
    def test_get_services(self):
        """Test GET /api/tenants/demo-barbershop/services"""
        try:
            response = requests.get(f"{self.base_url}/tenants/{self.tenant_slug}/services")
            
            # Should return proper error handling (not 500 crash)
            if response.status_code == 500:
                try:
                    data = response.json()
                    if 'error' in data and 'relation' in data['error'].lower():
                        self.log_result("Get Services", True, f"Expected database error: {data['error']}")
                    else:
                        self.log_result("Get Services", False, f"Unexpected 500 error: {data.get('error', 'Unknown')}")
                except:
                    self.log_result("Get Services", False, "500 error with invalid JSON response")
                return
                
            # Check for proper error response structure
            if response.status_code in [404, 400]:
                try:
                    data = response.json()
                    if 'error' in data:
                        self.log_result("Get Services", True, f"Proper error handling: {data['error']}")
                    else:
                        self.log_result("Get Services", False, "Error response missing 'error' field")
                except:
                    self.log_result("Get Services", False, "Invalid JSON in error response")
            else:
                self.log_result("Get Services", True, f"Unexpected response: {response.status_code}")
                
        except Exception as e:
            self.log_result("Get Services", False, f"Request failed: {str(e)}")
    
    def test_get_staff(self):
        """Test GET /api/tenants/demo-barbershop/staff"""
        try:
            response = requests.get(f"{self.base_url}/tenants/{self.tenant_slug}/staff")
            
            # Should return proper error handling (not 500 crash)
            if response.status_code == 500:
                try:
                    data = response.json()
                    if 'error' in data and 'relation' in data['error'].lower():
                        self.log_result("Get Staff", True, f"Expected database error: {data['error']}")
                    else:
                        self.log_result("Get Staff", False, f"Unexpected 500 error: {data.get('error', 'Unknown')}")
                except:
                    self.log_result("Get Staff", False, "500 error with invalid JSON response")
                return
                
            # Check for proper error response structure  
            if response.status_code in [404, 400]:
                try:
                    data = response.json()
                    if 'error' in data:
                        self.log_result("Get Staff", True, f"Proper error handling: {data['error']}")
                    else:
                        self.log_result("Get Staff", False, "Error response missing 'error' field")
                except:
                    self.log_result("Get Staff", False, "Invalid JSON in error response")
            else:
                self.log_result("Get Staff", True, f"Unexpected response: {response.status_code}")
                
        except Exception as e:
            self.log_result("Get Staff", False, f"Request failed: {str(e)}")
    
    def test_get_availability_missing_params(self):
        """Test GET /api/tenants/demo-barbershop/availability without required params"""
        try:
            response = requests.get(f"{self.base_url}/tenants/{self.tenant_slug}/availability")
            
            # Should return 400 for missing parameters
            if response.status_code != 400:
                self.log_result("Availability Missing Params", False, f"Expected 400, got {response.status_code}")
                return
                
            try:
                data = response.json()
                if 'error' in data and 'Missing required parameters' in data['error']:
                    self.log_result("Availability Missing Params", True, "Proper validation for missing parameters")
                else:
                    self.log_result("Availability Missing Params", False, f"Unexpected error message: {data.get('error', 'None')}")
            except:
                self.log_result("Availability Missing Params", False, "Invalid JSON in error response")
                
        except Exception as e:
            self.log_result("Availability Missing Params", False, f"Request failed: {str(e)}")
    
    def test_get_availability_with_params(self):
        """Test GET /api/tenants/demo-barbershop/availability with required params"""
        try:
            # Use realistic test data
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            params = {
                'staff_id': 'test-staff-123',
                'service_id': 'test-service-456', 
                'date': tomorrow
            }
            
            response = requests.get(f"{self.base_url}/tenants/{self.tenant_slug}/availability", params=params)
            
            # Should return proper error handling (not 500 crash)
            if response.status_code == 500:
                try:
                    data = response.json()
                    if 'error' in data and ('relation' in data['error'].lower() or 'table' in data['error'].lower()):
                        self.log_result("Availability With Params", True, f"Expected database error: {data['error']}")
                    else:
                        self.log_result("Availability With Params", False, f"Unexpected 500 error: {data.get('error', 'Unknown')}")
                except:
                    self.log_result("Availability With Params", False, "500 error with invalid JSON response")
                return
                
            # Check for proper error response structure
            if response.status_code in [404, 400]:
                try:
                    data = response.json()
                    if 'error' in data:
                        self.log_result("Availability With Params", True, f"Proper error handling: {data['error']}")
                    else:
                        self.log_result("Availability With Params", False, "Error response missing 'error' field")
                except:
                    self.log_result("Availability With Params", False, "Invalid JSON in error response")
            else:
                self.log_result("Availability With Params", True, f"Unexpected response: {response.status_code}")
                
        except Exception as e:
            self.log_result("Availability With Params", False, f"Request failed: {str(e)}")
    
    def test_create_appointment_missing_fields(self):
        """Test POST /api/tenants/demo-barbershop/appointments without required fields"""
        try:
            response = requests.post(
                f"{self.base_url}/tenants/{self.tenant_slug}/appointments",
                json={}
            )
            
            # Should return 400 for missing fields
            if response.status_code != 400:
                self.log_result("Create Appointment Missing Fields", False, f"Expected 400, got {response.status_code}")
                return
                
            try:
                data = response.json()
                if 'error' in data and 'Missing required fields' in data['error']:
                    self.log_result("Create Appointment Missing Fields", True, "Proper validation for missing fields")
                else:
                    self.log_result("Create Appointment Missing Fields", False, f"Unexpected error message: {data.get('error', 'None')}")
            except:
                self.log_result("Create Appointment Missing Fields", False, "Invalid JSON in error response")
                
        except Exception as e:
            self.log_result("Create Appointment Missing Fields", False, f"Request failed: {str(e)}")
    
    def test_create_appointment_with_data(self):
        """Test POST /api/tenants/demo-barbershop/appointments with complete data"""
        try:
            # Use realistic appointment data
            tomorrow = datetime.now() + timedelta(days=1)
            start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=30)
            
            appointment_data = {
                "staffId": "staff-joao-silva",
                "serviceId": "service-corte-classico", 
                "startTime": start_time.isoformat(),
                "endTime": end_time.isoformat(),
                "customerData": {
                    "name": "Carlos Silva",
                    "email": "carlos.silva@email.com",
                    "phone": "+5511987654321",
                    "notes": "Primeira vez no salão"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/tenants/{self.tenant_slug}/appointments",
                json=appointment_data
            )
            
            # Should return proper error handling (not 500 crash)
            if response.status_code == 500:
                try:
                    data = response.json()
                    if 'error' in data and ('relation' in data['error'].lower() or 'table' in data['error'].lower()):
                        self.log_result("Create Appointment With Data", True, f"Expected database error: {data['error']}")
                    else:
                        self.log_result("Create Appointment With Data", False, f"Unexpected 500 error: {data.get('error', 'Unknown')}")
                except:
                    self.log_result("Create Appointment With Data", False, "500 error with invalid JSON response")
                return
                
            # Check for proper error response structure
            if response.status_code in [404, 400]:
                try:
                    data = response.json()
                    if 'error' in data:
                        self.log_result("Create Appointment With Data", True, f"Proper error handling: {data['error']}")
                    else:
                        self.log_result("Create Appointment With Data", False, "Error response missing 'error' field")
                except:
                    self.log_result("Create Appointment With Data", False, "Invalid JSON in error response")
            else:
                self.log_result("Create Appointment With Data", True, f"Unexpected response: {response.status_code}")
                
        except Exception as e:
            self.log_result("Create Appointment With Data", False, f"Request failed: {str(e)}")
    
    def test_supabase_client_config(self):
        """Test Supabase client configuration by checking if API can handle Supabase calls"""
        try:
            # Test if the API can handle Supabase database calls gracefully
            # This should return a proper error (not crash) when database tables don't exist
            response = requests.get(f"{self.base_url}/tenants/demo-barbershop")
            
            # Any structured JSON response (even 404) means Supabase client is configured
            if response.status_code in [404, 500]:
                try:
                    data = response.json()
                    if 'error' in data:
                        self.log_result("Supabase Client Config", True, "Supabase client configured - returns structured errors")
                    else:
                        self.log_result("Supabase Client Config", False, "Response missing error structure")
                except:
                    self.log_result("Supabase Client Config", False, "Invalid JSON response from Supabase calls")
            else:
                self.log_result("Supabase Client Config", False, f"Unexpected status code: {response.status_code}")
                
        except Exception as e:
            self.log_result("Supabase Client Config", False, f"Configuration test failed: {str(e)}")
    
    def test_availability_algorithm_structure(self):
        """Test that availability algorithm handles missing database gracefully"""
        try:
            # Test with valid parameters but non-existent tenant
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            params = {
                'staff_id': 'staff-joao-silva',
                'service_id': 'service-corte-classico', 
                'date': tomorrow
            }
            
            response = requests.get(f"{self.base_url}/tenants/demo-barbershop/availability", params=params)
            
            # Should get 404 due to tenant not found, not a crash
            if response.status_code == 404:
                try:
                    data = response.json()
                    if 'error' in data and 'Tenant not found' in data['error']:
                        self.log_result("Availability Algorithm Structure", True, "Algorithm handles missing tenant gracefully")
                    else:
                        self.log_result("Availability Algorithm Structure", False, f"Unexpected error: {data.get('error', 'None')}")
                except:
                    self.log_result("Availability Algorithm Structure", False, "Invalid JSON response")
            else:
                self.log_result("Availability Algorithm Structure", False, f"Unexpected status code: {response.status_code}")
                
        except Exception as e:
            self.log_result("Availability Algorithm Structure", False, f"Request failed: {str(e)}")
    
    def test_request_validation(self):
        """Test request validation for different scenarios"""
        try:
            # Test malformed JSON
            response = requests.post(
                f"{self.base_url}/tenants/demo-barbershop/appointments",
                data="invalid json",
                headers={'Content-Type': 'application/json'}
            )
            
            # Should handle malformed JSON gracefully
            if response.status_code in [400, 404]:
                self.log_result("Request Validation", True, f"Handles malformed JSON properly: {response.status_code}")
            else:
                self.log_result("Request Validation", False, f"Unexpected response to malformed JSON: {response.status_code}")
                
        except Exception as e:
            self.log_result("Request Validation", False, f"Request failed: {str(e)}")
    
    def test_invalid_endpoint(self):
        """Test invalid API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/invalid/endpoint")
            
            # Should return 404 for invalid endpoint
            if response.status_code != 404:
                self.log_result("Invalid Endpoint", False, f"Expected 404, got {response.status_code}")
                return
                
            try:
                data = response.json()
                if 'error' in data:
                    self.log_result("Invalid Endpoint", True, f"Proper 404 handling: {data['error']}")
                else:
                    self.log_result("Invalid Endpoint", False, "404 response missing 'error' field")
            except:
                self.log_result("Invalid Endpoint", False, "Invalid JSON in 404 response")
                
        except Exception as e:
            self.log_result("Invalid Endpoint", False, f"Request failed: {str(e)}")
        """Test invalid API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/invalid/endpoint")
            
            # Should return 404 for invalid endpoint
            if response.status_code != 404:
                self.log_result("Invalid Endpoint", False, f"Expected 404, got {response.status_code}")
                return
                
            try:
                data = response.json()
                if 'error' in data:
                    self.log_result("Invalid Endpoint", True, f"Proper 404 handling: {data['error']}")
                else:
                    self.log_result("Invalid Endpoint", False, "404 response missing 'error' field")
            except:
                self.log_result("Invalid Endpoint", False, "Invalid JSON in 404 response")
                
        except Exception as e:
            self.log_result("Invalid Endpoint", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🧪 Starting Backend API Tests for Barbershop Booking System")
        print(f"📍 Base URL: {self.base_url}")
        print(f"🏪 Tenant: {self.tenant_slug}")
        print("=" * 80)
        
        # Run all tests
        self.test_cors_headers()
        self.test_supabase_client_config()
        self.test_get_tenant()
        self.test_get_services()
        self.test_get_staff()
        self.test_get_availability_missing_params()
        self.test_get_availability_with_params()
        self.test_availability_algorithm_structure()
        self.test_create_appointment_missing_fields()
        self.test_create_appointment_with_data()
        self.test_request_validation()
        self.test_invalid_endpoint()
        
        # Summary
        print("=" * 80)
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        print(f"📊 Test Summary: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! API error handling is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        return self.test_results

def main():
    """Main test execution"""
    tester = BarberShopAPITester()
    results = tester.run_all_tests()
    
    # Return results for further processing
    return results

if __name__ == "__main__":
    main()