import React from 'react'


const SplashScreen = () => {

    const SplashScreen = () => {
        return (
          <div className="fixed inset-0 flex items-center justify-center bg-background  z-50">
            <div className="w-full max-w-sm flex flex-col items-center">
              <video 
                autoPlay 
                muted 
                className="w-full h-auto rounded-lg bg-background"
                onEnded={() => {}} 
              >
                <source src="/VrundavanSplace.mp4" type="video/mp4" />
                
              </video>
             
            </div>
          </div>
        )
      }
  return (
    <div>
      <SplashScreen />
    </div>
  )
}

export default SplashScreen
