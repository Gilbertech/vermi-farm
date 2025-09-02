@@ .. @@
 import React, { useState, useEffect } from 'react';
+import { apiClient } from './services/api';
 import { AppProvider } from './context/AppContext';
@@ .. @@
 function App() {
+  // Initialize API client with environment variables
+  useEffect(() => {
+    // Set up API client configuration
+    const token = localStorage.getItem('access_token');
+    if (token) {
+      apiClient.setToken(token);
+    }
+  }, []);
+
   return (