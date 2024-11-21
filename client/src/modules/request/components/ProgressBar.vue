<template>
    <div class="progress-bar">
        <div class="step completed">1 Apply</div>
        <div class="step">2 In Review</div>
        <div class="step">3 Approved/Rejected</div>
    </div>
</template>

<script>
export default {
    name: "ProgressBar"
}
</script>

<style>
.progress-bar {
    display: flex;
    justify-content: space-between;
    margin: 2rem 0;
}

.progress-bar .step {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    border-bottom: 2px solid #ccc;
}

.progress-bar .completed {
    border-bottom: 2px solid #007bff;
    font-weight: bold;
    color: #007bff;
}
</style>