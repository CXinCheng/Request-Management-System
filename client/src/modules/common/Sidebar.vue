<template>
    <div class="sidebar">
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/modules">Modules</a></li>
        <li><a href="/leave">Leave Applications</a></li>
        <li><a href="/requests">All Requests</a></li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: "Sidebar",
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 200px;
    background: #f4f4f4;
    height: 100vh;
    padding: 20px;
  }
  .sidebar ul {
    list-style-type: none;
    padding: 0;
  }
  .sidebar ul li {
    margin: 10px 0;
  }
  .sidebar ul li a {
    text-decoration: none;
    color: #333;
  }
  </style>
  