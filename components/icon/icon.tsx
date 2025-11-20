import Image from 'next/image';
import { FC } from 'react';

interface IconProps {
    className?: string;
}

export const IconFinance: FC<IconProps> = ({ className = '' }) => (
    <div className={`shrink-0 ${className}`}>
        <Image src="/assets/images/icons/finance.svg" width={20} height={20} alt="Finance" className="w-5 h-5 object-contain transition-all group-hover:brightness-110" />
    </div>
);

export const IconRegistration: FC<IconProps> = ({ className = '' }) => (
    <div className={`shrink-0 ${className}`}>
        <Image src="/assets/images/icons/reg.svg" width={20} height={20} alt="Registration" className="w-5 h-5 object-contain transition-all group-hover:brightness-110" />
    </div>
);

export const IconMarketing: FC<IconProps> = ({ className = '' }) => (
    <div className={`shrink-0 ${className}`}>
        <Image src="/assets/images/icons/marketing.svg" width={20} height={20} alt="Marketing" className="w-5 h-5 object-contain transition-all group-hover:brightness-110" />
    </div>
);

export const IconAcademic: FC<IconProps> = ({ className = '' }) => (
    <div className={`shrink-0 ${className}`}>
        <Image src="/assets/images/icons/aca.svg" width={20} height={20} alt="Academic" className="w-5 h-5 object-contain transition-all group-hover:brightness-110" />
    </div>
);

export const IconSchoolZone: FC<IconProps> = ({ className = '' }) => (
    <div className={`shrink-0 ${className}`}>
        <Image src="/assets/images/icons/scl.svg" width={20} height={20} alt="School Zone" className="w-5 h-5 object-contain transition-all group-hover:brightness-110" />
    </div>
);

export const IconSubject: FC<IconProps> = ({ className = '' }) => (
    <div className={`shrink-0 ${className}`}>
        <Image src="/assets/images/icons/sub.svg" width={20} height={20} alt="Subject" className="w-5 h-5 object-contain transition-all group-hover:brightness-110" />
    </div>
);

// Export all icons as a named object for easier imports
export const Icons = {
    Finance: IconFinance,
    Registration: IconRegistration,
    Marketing: IconMarketing,
    Academic: IconAcademic,
    SchoolZone: IconSchoolZone,
    Subject: IconSubject,
};

// Default export for convenience
export default Icons;
