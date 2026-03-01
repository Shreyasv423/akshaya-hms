import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedBeds() {
    console.log("Checking for existing beds...");
    const { count } = await supabase.from('beds').select('*', { count: 'exact', head: true });

    if (count > 0) {
        console.log(`Found ${count} beds. Skipping seeding.`);
        return;
    }

    console.log("Seeding 25 beds...");
    const newBeds = [];

    // 10 General Ward
    for (let i = 1; i <= 10; i++) {
        newBeds.push({ bed_number: `G-${i}`, ward: "General Ward", is_occupied: false });
    }
    // 5 Semi-Private
    for (let i = 1; i <= 5; i++) {
        newBeds.push({ bed_number: `SP-${i}`, ward: "Semi-Private", is_occupied: false });
    }
    // 5 Private
    for (let i = 1; i <= 5; i++) {
        newBeds.push({ bed_number: `P-${i}`, ward: "Private", is_occupied: false });
    }
    // 5 ICU
    for (let i = 1; i <= 5; i++) {
        newBeds.push({ bed_number: `ICU-${i}`, ward: "ICU", is_occupied: false });
    }

    const { error } = await supabase.from('beds').insert(newBeds);
    if (error) {
        console.error("Error seeding beds:", error.message);
    } else {
        console.log("Successfully seeded 25 beds!");
    }
}

seedBeds();
