import React, { useContext, useEffect } from "react";

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

export type BreadcrumbContextType = {
  setPath: (...path: { name: string, href: string }[]) => void,
  path: { name: string, href: string }[],
};
export const BreadcrumbContext = React.createContext<BreadcrumbContextType>([] as any);

const Breadcrumb: React.FC = () => (
  <BreadcrumbContext.Consumer>
    {context => (
      <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link underline="hover" color="inherit" href="/">Home</Link>
        {context.path.map((item, idx) => (
          <Link underline="hover" color="inherit" href={item.href} key={item.name}>
            {item.name}
          </Link>
        ))}
      </Breadcrumbs>
    )}
  </BreadcrumbContext.Consumer>
);

export default Breadcrumb;
