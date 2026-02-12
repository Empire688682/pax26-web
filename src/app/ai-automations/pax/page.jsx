"use client";
import Chatbot from '@/components/Chatbot/Chatbot';
import { useGlobalContext } from '@/components/Context';

const page = () => {
const { pax26 } = useGlobalContext();

    return (
        <div style={{ backgroundColor: pax26.secondaryBg }} className='px-6 py-15'>
            <Chatbot />
        </div>
    )
}

export default page
