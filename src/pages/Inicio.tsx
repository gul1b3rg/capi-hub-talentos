import AudienceSections from '../sections/AudienceSections';
import ConsultoriasPreview from '../sections/ConsultoriasPreview';
import Hero from '../sections/Hero';
import HowItWorks from '../sections/HowItWorks';

const Inicio = () => (
  <div className="space-y-0 pb-20">
    <Hero />
    <HowItWorks />
    <AudienceSections />
    <ConsultoriasPreview />
  </div>
);

export default Inicio;
