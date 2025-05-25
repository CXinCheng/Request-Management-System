<template>
    <div class="leave-application">
        <h5>Select Dates</h5>
        <hr />

        <!-- Date Selection -->
        <div class="date-selection">
            <label for="startDate">From:</label>
            <input
                type="date"
                id="startDate"
                v-model="leaveDates.startDate"
                @change="fetchModules"
                required
                style="
                    border: 0.5px solid #000;
                    padding: 5px;
                    border-radius: 3px;
                "
            />

            <label for="endDate">To:</label>
            <input
                type="date"
                id="endDate"
                v-model="leaveDates.endDate"
                min=""
                @change="fetchModules"
                required
                style="
                    border: 0.5px solid #000;
                    padding: 5px;
                    border-radius: 3px;
                "
            />
        </div>

        <!-- Modules -->
        <ModulesTable
            v-if="showModuleTable"
            v-model:selectedModules="selectedModules"
            :modules="modules"
        />

        <!-- Next Button -->
        <div class="form-actions">
            <button @click="saveChanges" :disabled="!selectedModules.length">
                Save Changes
            </button>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import ModulesTable from "../components/ModuleTable.vue";
import { requestApiService } from "@/utils/ApiService";

export default {
    name: "LeaveModuleSelection",
    components: {
        ModulesTable,
    },
    data() {
        return {
            leaveDates: {
                startDate: null,
                endDate: null,
            },
            modules: [],
            selectedModules: [],
            showModuleTable: false,
            requestId: "",
        };
    },
    methods: {
        fetchModules() {
            if (this.leaveDates.startDate) {
                document
                    .getElementById("endDate")
                    .setAttribute("min", this.leaveDates.startDate);
            }

            if (this.leaveDates.startDate && this.leaveDates.endDate) {
                // Mocking module data for now
                this.modules = [
                    {
                        id: 1,
                        name: "Software Engineering Capstone",
                        code: "ABM5002",
                        professor: "Prof Xavier",
                        professorID: "P0123456A",
                    },
                    {
                        id: 3,
                        name: "Graphic Design Fundamentals",
                        code: "ABM5003",
                        professor: "Prof Xavier",
                        professorID: "P0123456A",
                    },
                    {
                        id: 4,
                        name: "Digital Illustration",
                        code: "ABM5004",
                        professor: "Prof Xavier",
                        professorID: "P0123456A",
                    },
                    {
                        id: 5,
                        name: "UX/UI Design Principles",
                        code: "ABM5106",
                        professor: "Prof Jane",
                        professorID: "P0123456A",
                    },
                    {
                        id: 6,
                        name: "Color Theory and Application",
                        code: "AC5004",
                        professor: "Prof Jane",
                        professorID: "P0123456A",
                    },
                    {
                        id: 7,
                        name: "Visual Communication Design",
                        code: "AC5012",
                        professor: "Prof Jane",
                        professorID: "P0123456A",
                    },
                ];
                this.showModuleTable = true;
            } else {
                this.modules = [];
            }
        },
        async saveChanges() {
            this.requestId = this.$route.params.requestId;

            try {
                // await axios.put(`http://localhost:3002/api/v1/requests/student/${this.requestId}`, { start_date: this.leaveDates.startDate, end_date: this.leaveDates.endDate, modules: this.selectedModules });
                await requestApiService.updateRequest(this.requestId, {
                    start_date: this.leaveDates.startDate,
                    end_date: this.leaveDates.endDate,
                    modules: this.selectedModules,
                });
                this.$router.push("/requests"); // redirect to Request List page after updating
            } catch (error) {
                console.error("Error updating request:", error);
            }
        },
    },
};
</script>

<style scoped>
.leave-application {
    max-width: 900px;
    width: 90%;
    margin: 0 auto;
    font-family: Arial, sans-serif;
}

.info-item {
    flex: 1;
    display: flex;
    justify-content: space-between;
}

.date-selection {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
}

.form-actions {
    text-align: right;
    margin-top: 2rem;
}

input[type="date"]:focus {
    border: 1px solid #555;
}

button {
    padding: 0.75rem 1.5rem;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>
