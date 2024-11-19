<template>
    <header class="header">
      <h1>Welcome, User!</h1>
      <div class="header-controls">
        <input type="text" placeholder="Search" />
        <div class="icons">
          <i class="icon-bell"></i>
          <i class="icon-message"></i>
          <i class="icon-user"></i>
        </div>
      </div>
    </header>
  </template>
  
  <script>
  export default {
    name: 'Header',
  };
  </script>
  
  <style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #ddd;
  }
  .header input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .header .icons i {
    margin: 0 10px;
    font-size: 1.5em;
  }
  </style>
  