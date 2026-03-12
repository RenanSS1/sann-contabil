import { AdContainer } from './AdContainer';
import { AdsenseAd } from './AdsenseAd';

export const ReportAd = () => (
  <AdContainer width="100%">
    <AdsenseAd 
      slot="REPORT_SLOT" 
      responsive={true} 
    />
  </AdContainer>
);
