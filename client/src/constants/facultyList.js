import { moduleApiService } from "@/utils/ApiService";

export const getFacultyList = async () => {
    const response = await moduleApiService.getAllFaculties();
    return response.data.map((faculty) => faculty.name);
};