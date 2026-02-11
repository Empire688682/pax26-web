"use client";
import TestAIAssistantPage from '@/components/AiPreviewTestPage/AiPreviewTestPage';
import AISettingsPage from '@/components/AiSettings/AiSettings'
import { useGlobalContext } from '@/components/Context';
import React, { useEffect, useState } from 'react'

const page = () => {
    const { pax26 } = useGlobalContext();
    const [activeTab, setActiveTab] = useState("settings");
    const [previewData, setPreviewData] = useState(false);

    const [aiData, setAiData] = useState({
        aiName: "",
        businessName: "",
        tone: "",
        responseLength: "",
        instructions: "",
        handoffRule: "",
        lastTrained: null,
    });

    const handleInputChange = (field, value) => {
        setAiData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedData = localStorage.getItem("aiData");
            if (storedData) {
                setAiData(JSON.parse(storedData));
            }
        }
    }, []);

    const changeTabs = (tab) => {
        if (activeTab === tab) return;
        if (
            tab === "test" &&
            !aiData.aiName ||
            !aiData.businessName ||
            !aiData.instructions ||
            !aiData.handoffRule ||
            !aiData.responseLength ||
            !aiData.tone) {
            alert("Please fill in all fields before saving.");
            return};
            setActiveTab(tab);
        }

        useEffect(() => {
            if (
                aiData.aiName &&
                aiData.businessName &&
                aiData.instructions &&
                aiData.handoffRule &&
                aiData.responseLength &&
                aiData.tone) {
                setPreviewData(true);
            } else {
                setPreviewData(false);
            }
        }, [aiData]);


        return (
            <div style={{ backgroundColor: pax26.secondaryBg }} className='px-6 py-10'>
                <div className='mb-4'>
                    <h1 className='text-3xl font-semibold' style={{ color: pax26.textPrimary }}>AI Labrary</h1>
                    <p className='text-sm' style={{ color: pax26.textSecondary }}>Configure your AI assistant's behavior and test responses</p>
                </div>

                <div className='mb-6 md:hidden display'>
                    <button
                        onClick={() => changeTabs("settings")}
                        className={`px-4 py-2 rounded-tl-xl cursor-pointer rounded-bl-xl ${activeTab === "settings" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >                    AI Settings
                    </button>
                    <button
                        onClick={() => changeTabs("preview")}
                        className={`px-4 py-2 rounded-tr-xl cursor-pointer rounded-br-xl ${activeTab === "preview" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        Ai Preview
                    </button>
                </div>

                {/* Mobile screen */}
                <div className='grid display md:hidden md:grid-cols-2 text-start grid-cols-1 gap-6 justify-start items-start'>
                    {
                        activeTab === "settings" ? < AISettingsPage
                            handleInputChange={handleInputChange}
                            setAiData={setAiData}
                            aiData={aiData}
                        /> : <TestAIAssistantPage
                            handleInputChange={handleInputChange}
                            setAiData={setAiData}
                            aiData={aiData}
                            previewData={true}
                        />
                    }
                </div>

                {/* Big screen */}
                <div className='grid hidden md:flex md:grid-cols-2 text-start grid-cols-1 gap-6 justify-start items-start'>
                    < AISettingsPage
                        handleInputChange={handleInputChange}
                        setAiData={setAiData}
                        aiData={aiData}
                    />
                    <TestAIAssistantPage
                        handleInputChange={handleInputChange}
                        setAiData={setAiData}
                        aiData={aiData}
                        previewData={previewData}
                    />
                </div>
            </div>
        )
    }

    export default page
