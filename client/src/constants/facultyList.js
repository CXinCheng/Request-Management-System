import { moduleApiService } from "@/utils/ApiService";

export const facultyList = await moduleApiService
    .getAllFaculties()
    .then((res) => res.data.map((faculty) => faculty.name));
