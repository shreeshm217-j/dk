import requests
import sys
import json
from datetime import datetime

class DKPizzaAPITester:
    def __init__(self, base_url="https://dk-pizza-menu.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, status_code, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED (Status: {status_code})")
        else:
            print(f"❌ {test_name} - FAILED (Status: {status_code}) - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "status_code": status_code,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = {"raw": response.text[:200]}
            
            self.log_result(name, success, response.status_code, 
                           response.text[:100] if not success else "")
            
            return success, response_data

        except Exception as e:
            print(f"   Exception: {str(e)}")
            self.log_result(name, False, 0, str(e))
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_admin_signup(self):
        """Test admin user signup"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "email": f"admin_{timestamp}@dkpizza.com",
            "password": "TestPass123!",
            "full_name": f"Test Admin {timestamp}"
        }
        
        success, response = self.run_test(
            "Admin Signup", "POST", "auth/signup", 200, user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_admin_login(self):
        """Test admin login with existing credentials"""
        # Try with a known admin account (if signup worked, use that)
        login_data = {
            "email": "admin@dkpizza.com", 
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login", "POST", "auth/login", 200, login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_user_profile(self):
        """Test getting current user profile"""
        return self.run_test(
            "Get User Profile", "GET", "auth/me", 200, auth_required=True
        )[0]

    def test_get_menu(self):
        """Test getting menu items"""
        return self.run_test(
            "Get Menu", "GET", "menu", 200
        )[0]

    def test_get_menu_by_category(self):
        """Test getting menu items by category"""
        return self.run_test(
            "Get Menu by Category", "GET", "menu?category=Pizzas", 200
        )[0]

    def test_create_menu_item(self):
        """Test creating a new menu item"""
        timestamp = datetime.now().strftime("%H%M%S")
        menu_item = {
            "name": f"Test Pizza {timestamp}",
            "description": "A delicious test pizza with fresh ingredients",
            "price": 299.99,
            "category": "Pizzas",
            "image_url": "https://example.com/test-pizza.jpg",
            "available": True
        }
        
        success, response = self.run_test(
            "Create Menu Item", "POST", "menu", 200, menu_item, auth_required=True
        )
        
        if success:
            self.created_item_id = response.get('id')
            return True
        return False

    def test_update_menu_item(self):
        """Test updating a menu item"""
        if not hasattr(self, 'created_item_id'):
            print("   Skipping - no item to update")
            return False
            
        update_data = {
            "price": 349.99,
            "available": False
        }
        
        return self.run_test(
            "Update Menu Item", "PUT", f"menu/{self.created_item_id}", 
            200, update_data, auth_required=True
        )[0]

    def test_delete_menu_item(self):
        """Test deleting a menu item"""
        if not hasattr(self, 'created_item_id'):
            print("   Skipping - no item to delete")
            return False
            
        return self.run_test(
            "Delete Menu Item", "DELETE", f"menu/{self.created_item_id}", 
            200, auth_required=True
        )[0]

    def test_get_settings(self):
        """Test getting cafe settings"""
        return self.run_test(
            "Get Settings", "GET", "settings", 200
        )[0]

    def test_update_settings(self):
        """Test updating cafe settings"""
        settings_data = {
            "opening_hours": "10:00 AM – 11:00 PM",
            "phone": "+91 99564 07087"
        }
        
        return self.run_test(
            "Update Settings", "PUT", "settings", 200, 
            settings_data, auth_required=True
        )[0]

    def test_create_order(self):
        """Test creating a WhatsApp order"""
        order_data = {
            "items": [
                {"id": "1", "name": "Margherita Pizza", "price": 250, "quantity": 2},
                {"id": "2", "name": "Garlic Bread", "price": 120, "quantity": 1}
            ],
            "total": 620.0,
            "customer_address": "Test Address, Mallawan"
        }
        
        return self.run_test(
            "Create Order", "POST", "orders", 200, order_data
        )[0]

    def test_get_orders(self):
        """Test getting WhatsApp orders (admin only)"""
        return self.run_test(
            "Get Orders", "GET", "orders", 200, auth_required=True
        )[0]

    def test_get_reviews(self):
        """Test getting reviews"""
        return self.run_test(
            "Get Reviews", "GET", "reviews", 200
        )[0]

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting DK Pizza Cafe API Tests")
        print("=" * 60)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Authentication flow
        if not self.test_admin_signup():
            # If signup fails, try login
            self.test_admin_login()
        
        if self.token:
            self.test_get_user_profile()
        
        # Menu operations
        self.test_get_menu()
        self.test_get_menu_by_category()
        
        if self.token:
            self.test_create_menu_item()
            self.test_update_menu_item()
            self.test_delete_menu_item()
        
        # Settings
        self.test_get_settings()
        if self.token:
            self.test_update_settings()
        
        # Orders
        self.test_create_order()
        if self.token:
            self.test_get_orders()
        
        # Reviews
        self.test_get_reviews()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = DKPizzaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())