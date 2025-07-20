import { useState } from 'react'

import './App.css'
import NavBar from './components/NavBar'
import FileUpload from './components/FileUpload'
import Summarize from './components/Summarize'

function App() {

  return (
    <div className="layout-container flex h-full grow flex-col">
      <NavBar />
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className = "layout-content-container flex flex-col max-w-[960px] flex-1">
          <div class="@container">
              <div class="@[480px]:p-4">
                <div class="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4" style="background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(&quot;https://lh3.googleusercontent.com/aida-public/AB6AXuA8SJ_F5yFQkYoGW4gOh4bwZnaQo-FuQ9UlFyFPJ8Ywy4AcCAeZjc4vEnnCr86fvB_T2z0rxNEyv5Jsbyshp08-9ulQ4SSc7IzT7ssbEQSqKU2HftZ-4Ge-gM6AAZ97vSbZW1GOcSrGPNTibck1GJp6B52hzgQFy39pkR-mL04cz7CdWoDrucAgi0XQxLXHJrZO_zZrtdH2vtcUA26L_od56ksf4PbY2PoDk-Qypo1SDr3mQOLpCcwjyltzRpNz7H6rP0wtNEepr19Q&quot;);">
                  <div class="flex flex-col gap-2 text-center">
                    <h1 class="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Summarize and Classify News Articles Effortlessly
                    </h1>
                    <h2 class="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Upload your news articles or documents and get concise summaries and classifications with a unique ID for easy tracking.
                    </h2>
                  </div>
                  <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#d2e2f3] text-[#121417] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                    <span class="truncate">Get Started</span>
                  </button>
                </div>
              </div>
          </div>
          {/* <FileUpload/>
          <Summarize /> */}
        </div>
      </div>
    </div>
  )
}

export default App
