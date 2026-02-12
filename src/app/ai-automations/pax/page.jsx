"use client";
import Chatbot from '@/components/Chatbot/Chatbot';
import { useGlobalContext } from '@/components/Context';

const page = () => {
const { pax26 } = useGlobalContext();

    return (
        <div style={{ backgroundColor: pax26.secondaryBg }} className='p-6'>
            <Chatbot />
        </div>
    )
}

export default page
