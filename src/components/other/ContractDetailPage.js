import React from 'react';
import { useParams } from 'react-router-dom';
import MsaDetail from './MsaDetail';
import NdaDetail from './NdaDetail';
import SowDetail from './SowDetail';
import CrDetail from './CrDetail';
import PoDetail from './PoDetail';

const ContractDetailPage = () => {
  const { contractType, id } = useParams();

  const componentMap = {
    msa: <MsaDetail id={id} />,
    nda: <NdaDetail id={id} />,
    sow: <SowDetail id={id} />,
    cr: <CrDetail id={id} />,
    po: <PoDetail id={id} />,
  };

  const selectedComponent = componentMap[contractType] || (
    <div>Invalid contract type</div>
  );

  console.log('contractType', contractType);
  return <div>{selectedComponent}</div>;
};

export default ContractDetailPage;
