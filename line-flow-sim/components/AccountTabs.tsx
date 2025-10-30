import Link from 'next/link';

import type { Flow } from '@/types/flow';

type Props = {
  accounts: { key: Flow['key']; label: string }[];
  activeKey?: Flow['key'];
};

const AccountTabs = ({ accounts, activeKey }: Props) => {
  return (
    <nav className="tabs">
      {accounts.map(account => {
        const isActive = account.key === activeKey;
        const className = ['tab', isActive ? 'tab-active' : null].filter(Boolean).join(' ');
        return (
          <Link
            key={account.key}
            href={`/demo/${account.key}`}
            className={className}
          >
            {account.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AccountTabs;
