# Frontend Integration Guide

This document provides all the information needed to connect your Vue.js frontend to this Express.js backend.

---

## 🌐 Backend Deployment Information

**Base URL:** `https://cst3144-backend-cw1.onrender.com`

**API Status:** ✅ Live and operational

---

## 📋 Available API Endpoints

### 1. Get All Lessons
**Endpoint:** `GET /lessons`
**URL:** `https://cst3144-backend-cw1.onrender.com/lessons`

**Description:** Retrieves all available lessons from the database.

**Response Example:**
```json
[
  {
    "id": "69031072d1c6e902d7841e61",
    "subject": "Math",
    "location": "Oxford",
    "price": 100,
    "spaces": 5
  },
  {
    "id": "69031072d1c6e902d7841e5d",
    "subject": "English",
    "location": "London",
    "price": 90,
    "spaces": 5
  }
  // ... more lessons
]
```

**Frontend Implementation:**
```javascript
// In your Vue.js component
async fetchLessons() {
  try {
    const response = await fetch('https://cst3144-backend-cw1.onrender.com/lessons');
    if (!response.ok) throw new Error('Failed to fetch lessons');
    const lessons = await response.json();
    this.lessons = lessons; // Store in your Vue data
  } catch (error) {
    console.error('Error fetching lessons:', error);
  }
}
```

---

### 2. Search Lessons
**Endpoint:** `GET /lessons/search?q={searchTerm}`
**URL:** `https://cst3144-backend-cw1.onrender.com/lessons/search?q=math`

**Description:** Searches lessons by subject, location, price, or spaces. Supports "search as you type" functionality.

**Query Parameters:**
- `q` (required): Search query string

**Response Example:**
```json
[
  {
    "id": "69031072d1c6e902d7841e61",
    "subject": "Math",
    "location": "Oxford",
    "price": 100,
    "spaces": 5
  }
  // ... matching lessons
]
```

**Frontend Implementation:**
```javascript
// In your Vue.js component
data() {
  return {
    searchQuery: '',
    lessons: []
  }
},
watch: {
  // Implement "search as you type"
  searchQuery(newQuery) {
    if (newQuery.trim()) {
      this.searchLessons(newQuery);
    } else {
      this.fetchLessons(); // Show all if empty
    }
  }
},
methods: {
  async searchLessons(query) {
    try {
      const url = `https://cst3144-backend-cw1.onrender.com/lessons/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed');
      const results = await response.json();
      this.lessons = results;
    } catch (error) {
      console.error('Error searching lessons:', error);
    }
  }
}
```

---

### 3. Update Lesson (Decrease Spaces)
**Endpoint:** `PUT /lessons/:id`
**URL:** `https://cst3144-backend-cw1.onrender.com/lessons/{lessonId}`

**Description:** Updates a lesson's attributes (primarily used to decrease available spaces after adding to cart).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "spaces": 4
}
```

**Response Example:**
```json
{
  "id": "69031072d1c6e902d7841e61",
  "subject": "Math",
  "location": "Oxford",
  "price": 100,
  "spaces": 4
}
```

**Frontend Implementation:**
```javascript
// In your Vue.js component
async updateLessonSpaces(lessonId, newSpaces) {
  try {
    const response = await fetch(`https://cst3144-backend-cw1.onrender.com/lessons/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ spaces: newSpaces })
    });

    if (!response.ok) throw new Error('Failed to update lesson');
    const updatedLesson = await response.json();

    // Update local state
    const index = this.lessons.findIndex(l => l.id === lessonId);
    if (index !== -1) {
      this.lessons[index] = updatedLesson;
    }
  } catch (error) {
    console.error('Error updating lesson:', error);
  }
}
```

---

### 4. Create Order (Checkout)
**Endpoint:** `POST /orders`
**URL:** `https://cst3144-backend-cw1.onrender.com/orders`

**Description:** Creates a new order and automatically decrements lesson spaces atomically.

**Headers:**
```
Content-Type: application/json
```

**Request Body (Option 1 - Simple):**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "lessonIDs": ["69031072d1c6e902d7841e61", "69031072d1c6e902d7841e5d"],
  "spaces": 1
}
```

**Request Body (Option 2 - With Quantities):**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "lessons": [
    {
      "id": "69031072d1c6e902d7841e61",
      "quantity": 2
    },
    {
      "id": "69031072d1c6e902d7841e5d",
      "quantity": 1
    }
  ]
}
```

**Response Example:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "lessonIDs": ["69031072d1c6e902d7841e61", "69031072d1c6e902d7841e5d"],
  "spaces": [1, 1],
  "createdAt": "2025-12-08T00:00:00.000Z",
  "_id": "67550a1234567890abcdef12"
}
```

**Frontend Implementation:**
```javascript
// In your Vue.js component
data() {
  return {
    cart: [], // Array of lesson objects
    customerName: '',
    customerPhone: ''
  }
},
methods: {
  async submitOrder() {
    // Validate name (letters only)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(this.customerName)) {
      alert('Name must contain letters only');
      return;
    }

    // Validate phone (numbers only)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(this.customerPhone)) {
      alert('Phone must contain numbers only');
      return;
    }

    // Prepare order data
    const orderData = {
      name: this.customerName,
      phone: this.customerPhone,
      lessons: this.cart.map(item => ({
        id: item.id,
        quantity: item.quantity || 1
      }))
    };

    try {
      const response = await fetch('https://cst3144-backend-cw1.onrender.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Order failed');
      }

      const order = await response.json();

      // Show success message
      alert('Order submitted successfully!');

      // Clear cart and form
      this.cart = [];
      this.customerName = '';
      this.customerPhone = '';

      // Refresh lessons to show updated spaces
      await this.fetchLessons();

    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`Order failed: ${error.message}`);
    }
  }
}
```

---

## 🎨 Static Image Files

**Endpoint:** `GET /images/{filename}`
**Example:** `https://cst3144-backend-cw1.onrender.com/images/Math.svg`

**Available Images:**
- `Math.svg`
- `English.svg`
- `Science.svg`
- `Music.svg`
- `Art.svg`
- `History.svg`

**Frontend Implementation:**
```vue
<template>
  <img :src="`https://cst3144-backend-cw1.onrender.com/images/${lesson.subject}.svg`"
       :alt="lesson.subject"
       @error="handleImageError">
</template>

<script>
methods: {
  handleImageError(event) {
    // Fallback if image not found
    event.target.src = 'path/to/default-image.svg';
  }
}
</script>
```

---

## 🔧 Complete Vue.js Integration Example

### Complete Component Structure

```vue
<template>
  <div id="app">
    <!-- Search Bar -->
    <div v-if="showLessons" class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search lessons..."
      >
    </div>

    <!-- Lesson List Page -->
    <div v-if="showLessons">
      <h2>Available Lessons</h2>

      <!-- Cart Button -->
      <button
        @click="showCart = true"
        :disabled="cart.length === 0"
      >
        Cart ({{ cart.length }})
      </button>

      <!-- Lessons Display -->
      <div class="lessons-grid">
        <div v-for="lesson in lessons" :key="lesson.id" class="lesson-card">
          <img :src="`https://cst3144-backend-cw1.onrender.com/images/${lesson.subject}.svg`"
               :alt="lesson.subject">
          <h3>{{ lesson.subject }}</h3>
          <p>Location: {{ lesson.location }}</p>
          <p>Price: £{{ lesson.price }}</p>
          <p>Available Spaces: {{ lesson.spaces }}</p>

          <button
            @click="addToCart(lesson)"
            :disabled="lesson.spaces <= 0"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Shopping Cart Page -->
    <div v-else>
      <h2>Shopping Cart</h2>

      <button @click="showCart = false">Back to Lessons</button>

      <!-- Cart Items -->
      <div v-if="cart.length > 0">
        <div v-for="(item, index) in cart" :key="index" class="cart-item">
          <h3>{{ item.subject }}</h3>
          <p>Location: {{ item.location }}</p>
          <p>Price: £{{ item.price }}</p>
          <button @click="removeFromCart(index)">Remove</button>
        </div>

        <!-- Checkout Form -->
        <div class="checkout-form">
          <h3>Checkout</h3>
          <input
            v-model="customerName"
            type="text"
            placeholder="Name (letters only)"
          >
          <input
            v-model="customerPhone"
            type="text"
            placeholder="Phone (numbers only)"
          >
          <button
            @click="submitOrder"
            :disabled="!isCheckoutValid"
          >
            Checkout
          </button>
        </div>
      </div>

      <p v-else>Your cart is empty</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lessons: [],
      cart: [],
      searchQuery: '',
      showCart: false,
      customerName: '',
      customerPhone: ''
    };
  },

  computed: {
    showLessons() {
      return !this.showCart;
    },

    isCheckoutValid() {
      const nameRegex = /^[A-Za-z\s]+$/;
      const phoneRegex = /^[0-9]+$/;
      return nameRegex.test(this.customerName) &&
             phoneRegex.test(this.customerPhone) &&
             this.cart.length > 0;
    }
  },

  watch: {
    searchQuery(newQuery) {
      if (newQuery.trim()) {
        this.searchLessons(newQuery);
      } else {
        this.fetchLessons();
      }
    }
  },

  methods: {
    async fetchLessons() {
      try {
        const response = await fetch('https://cst3144-backend-cw1.onrender.com/lessons');
        if (!response.ok) throw new Error('Failed to fetch lessons');
        this.lessons = await response.json();
      } catch (error) {
        console.error('Error fetching lessons:', error);
        alert('Failed to load lessons. Please try again.');
      }
    },

    async searchLessons(query) {
      try {
        const url = `https://cst3144-backend-cw1.onrender.com/lessons/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Search failed');
        this.lessons = await response.json();
      } catch (error) {
        console.error('Error searching lessons:', error);
      }
    },

    addToCart(lesson) {
      if (lesson.spaces <= 0) return;

      // Add to cart
      this.cart.push({ ...lesson });

      // Decrease spaces locally
      const index = this.lessons.findIndex(l => l.id === lesson.id);
      if (index !== -1) {
        this.lessons[index].spaces--;
      }
    },

    removeFromCart(index) {
      const removedLesson = this.cart[index];

      // Remove from cart
      this.cart.splice(index, 1);

      // Increase spaces locally
      const lessonIndex = this.lessons.findIndex(l => l.id === removedLesson.id);
      if (lessonIndex !== -1) {
        this.lessons[lessonIndex].spaces++;
      }
    },

    async submitOrder() {
      if (!this.isCheckoutValid) return;

      const orderData = {
        name: this.customerName,
        phone: this.customerPhone,
        lessons: this.cart.map(item => ({
          id: item.id,
          quantity: 1
        }))
      };

      try {
        const response = await fetch('https://cst3144-backend-cw1.onrender.com/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Order failed');
        }

        alert('Order submitted successfully!');

        // Clear cart and form
        this.cart = [];
        this.customerName = '';
        this.customerPhone = '';
        this.showCart = false;

        // Refresh lessons
        await this.fetchLessons();

      } catch (error) {
        console.error('Error submitting order:', error);
        alert(`Order failed: ${error.message}`);
      }
    }
  },

  mounted() {
    this.fetchLessons();
  }
};
</script>
```

---

## ⚠️ Important Notes for Frontend Developer

### 1. **CORS is Enabled**
The backend has CORS enabled, so your frontend can make requests from any origin.

### 2. **Use Fetch (Required)**
The coursework requires using the native `fetch` API with promises. Do NOT use:
- XMLHttpRequest
- axios
- jQuery AJAX

### 3. **Validation Requirements**
- **Name**: Must be letters only (use regex: `/^[A-Za-z\s]+$/`)
- **Phone**: Must be numbers only (use regex: `/^[0-9]+$/`)
- Validate in JavaScript before submitting

### 4. **Button States**
- "Add to Cart" button: Always visible, enabled only when `spaces > 0`
- "Checkout" button: Always visible, enabled only when name and phone are valid

### 5. **Order Submission**
When you submit an order via POST `/orders`, the backend will:
- Automatically decrement the lesson spaces in the database
- Use MongoDB transactions to ensure data consistency
- Return error if not enough spaces available

**You do NOT need to call PUT `/lessons/:id` after POST `/orders`** - the backend handles it atomically.

### 6. **Error Handling**
Always handle errors gracefully:
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  // Process response
} catch (error) {
  console.error('Error:', error);
  alert(`Error: ${error.message}`);
}
```

---

## 🧪 Testing with Postman

Import the Postman collection from: `postman/lesson-booking.postman_collection.json`

The collection includes all 4 endpoints pre-configured with the Render URL.

---

## 📞 Support

If you encounter any issues with the backend API:
1. Check the browser console for error messages
2. Verify the API endpoint URLs are correct
3. Ensure request headers include `Content-Type: application/json` for POST/PUT
4. Check that the Render deployment is running: https://cst3144-backend-cw1.onrender.com/health

---

**Last Updated:** December 8, 2025
**Backend Version:** 1.0.0
**Deployment:** Render (https://cst3144-backend-cw1.onrender.com)
