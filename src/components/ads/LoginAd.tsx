import { AdContainer } from './AdContainer';
import { AdsenseAd } from './AdsenseAd';

export const LoginAd = () => (
  <div className="mt-6">
    <AdContainer width="100%">
      <AdsenseAd 
        slot="LOGIN_SLOT" 
        responsive={true} 
      />
    </AdContainer>
  </div>
);
