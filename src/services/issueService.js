import { supabase } from './supabase';

// Check if a string is a valid UUID
const isValidUUID = (str) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const issueService = {
    /**
     * Uploads the photo to Supabase Storage
     * @param {File|Blob} file - The file/blob to upload
     * @param {string} userId - The user ID or 'anonymous'
     * @returns {Promise<string>} - The public URL of the uploaded photo
     */
    async uploadPhoto(file, userId = 'anonymous') {
        // Camera captures return Blobs (no .name). Default to jpg.
        const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
            .from('issue-photos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('issue-photos')
            .getPublicUrl(fileName);

        return publicUrl;
    },

    /**
     * Calculates priority using the Edge Function
     * @param {object} issueData - { issue_type, description, location }
     * @returns {Promise<object>} - { priority_score, priority_level }
     */
    async calculatePriority(issueData) {
        try {
            const { data, error } = await supabase.functions.invoke('calculate-priority', {
                body: issueData
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Priority calculation failed:', error);
            // Fallback
            return { priority_score: 50, priority_level: 'medium' };
        }
    },

    /**
     * Submits a new issue
     * @param {object} issueData - The issue details
     * @param {File|Blob} photoFile - The photo file/blob
     * @returns {Promise<object>} - The created issue
     */
    async submitIssue(issueData, photoFile) {
        try {
            // Sanitize citizen_id — must be a real UUID or null (demo login uses a non-UUID string)
            const citizen_id = isValidUUID(issueData.citizen_id) ? issueData.citizen_id : null;

            // 1. Upload Photo (use 'anonymous' folder if no valid citizen_id)
            const photoUrl = await this.uploadPhoto(photoFile, citizen_id || 'anonymous');

            // 2. Calculate Priority
            const priorityResult = await this.calculatePriority({
                issue_type: issueData.issue_type,
                description: issueData.description,
                location: issueData.location_address
            });

            // 3. Insert Record
            const { data, error } = await supabase
                .from('issues')
                .insert({
                    ...issueData,
                    citizen_id,              // sanitized UUID or null
                    photo_url: photoUrl,
                    priority: priorityResult.priority_level,
                    ai_priority_score: priorityResult.priority_score,
                    status: 'new'
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', JSON.stringify(error, null, 2));
                throw error;
            }
            return data;

        } catch (error) {
            console.error('Submit Issue Error:', error.message || error);
            throw error;
        }
    }
};
