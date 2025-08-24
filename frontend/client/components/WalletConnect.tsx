import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Wallet, Check, Copy, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';

interface WalletInfoUi {
  name: string;
  icon: string;
  description: string;
  id: string; // connector id
  downloadUrl: string;
}

const supportedWallets: WalletInfoUi[] = [
  {
    name: 'Braavos',
    icon: '🛡️',
    description: 'Smart wallet with advanced security features',
    id: 'braavos',
    downloadUrl: 'https://braavos.app/'
  },
  {
    name: 'Argent X',
    icon: '🔷',
    description: 'User-friendly StarkNet wallet',
    id: 'argentX',
    downloadUrl: 'https://www.argent.xyz/argent-x/'
  }
];

export function WalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState<string | null>(null);

  const { address, isConnected, status } = useAccount();
  const { connect, connectors, error: connectError, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();

  // Resolve a connector by id or name substring (e.g., 'braavos', 'argentx')
  const resolveConnector = useMemo(() => (
    (id: string) => {
      const lower = id.toLowerCase();
      return connectors.find((c: any) => (c.id && c.id === id) || (c.name && c.name.toLowerCase().includes(lower)));
    }
  ), [connectors]);

  useEffect(() => {
    // Persist the connected address for use in forms & emit event
    if (isConnected && address) {
      localStorage.setItem('walletAddress', address);
      setManualAddress(address);
      try { window.dispatchEvent(new CustomEvent('wallet:connected', { detail: { address } })); } catch {}
    } else if (!isConnected) {
      localStorage.removeItem('walletAddress');
      setManualAddress(null);
      try { window.dispatchEvent(new CustomEvent('wallet:disconnected')); } catch {}
    }
  }, [isConnected, address]);

  // Listen for external events (focus, wallet events) to recover address if hooks haven't updated yet
  useEffect(() => {
    const onFocus = () => {
      const a = localStorage.getItem('walletAddress');
      if (a) setManualAddress(a);
    };
    const onWalletConnected = (e: any) => {
      const a = e?.detail?.address;
      if (a) setManualAddress(a);
    };
    (window as any)?.starknet_braavos?.on?.('accountsChanged', (acc: any) => {
      const a = (Array.isArray(acc) ? acc[0] : acc?.address) || (window as any)?.starknet_braavos?.account?.address;
      if (a) {
        localStorage.setItem('walletAddress', a);
        setManualAddress(a);
      }
    });
    window.addEventListener('focus', onFocus);
    window.addEventListener('wallet:connected', onWalletConnected as EventListener);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('wallet:connected', onWalletConnected as EventListener);
    };
  }, []);

  // Surface connection errors to UI
  useEffect(() => {
    if (connectError) {
      setError(connectError.message || 'Failed to connect wallet');
    }
  }, [connectError]);

  const handleConnect = async (id: string) => {
    setError(null);
    const connector = resolveConnector(id);
    if (!connector) {
      setError('Requested wallet connector is not available in this browser. Install the extension and reload.');
      return;
    }
    try {
      await connect({ connector });
      // Try to eagerly fetch address from injected providers for immediate UI update
      const braavosAddr = (window as any)?.starknet_braavos?.account?.address;
      const anyAddr = braavosAddr || (window as any)?.starknet?.account?.address;
      if (anyAddr) {
        localStorage.setItem('walletAddress', anyAddr);
        setManualAddress(anyAddr);
        try { window.dispatchEvent(new CustomEvent('wallet:connected', { detail: { address: anyAddr } })); } catch {}
      }
      setIsOpen(false);
    } catch (e: any) {
      console.error('Wallet connection error:', e);
      setError(e?.message || 'Failed to connect wallet');
    }
  };

  const copyAddress = () => {
    const disp = address || manualAddress || (typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : '');
    if (disp) {
      navigator.clipboard.writeText(disp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const displayAddress = address || manualAddress || (typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null);

  if (displayAddress) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="flex items-center space-x-2 px-3 py-1">
          <span>💼</span>
          <span className="text-xs font-medium">Connected</span>
        </Badge>
        <div className="flex items-center space-x-1">
          <code className="text-xs bg-muted px-2 py-1 rounded">{formatAddress(displayAddress)}</code>
          <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              try { disconnect(); } catch {}
              localStorage.removeItem('walletAddress');
              setManualAddress(null);
              try { window.dispatchEvent(new CustomEvent('wallet:disconnected')); } catch {}
            }}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Connect StarkNet Wallet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Supported Wallets */}
          <div className="space-y-3">
            {supportedWallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-muted-foreground">{wallet.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                    <a href={wallet.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button onClick={() => handleConnect(wallet.id)} disabled={status === 'connecting' || connectStatus === 'pending'} className="min-w-[100px]">
                    {status === 'connecting' || connectStatus === 'pending' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Wallet Address (manual) */}
          <div className="border-t pt-4">
            <ManualAddress />
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-800">Connection Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ManualAddress() {
  const [show, setShow] = useState(false);
  const [addr, setAddr] = useState('');

  const onConnect = () => {
    if (!addr.trim()) return;
    localStorage.setItem('walletAddress', addr.trim());
    setShow(false);
  };

  if (!show) {
    return (
      <Button variant="outline" onClick={() => setShow(true)} className="w-full">
        Use Custom Address
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Custom Wallet Address</div>
      <div className="flex space-x-2">
        <Input placeholder="Enter wallet address (0x...)" value={addr} onChange={(e) => setAddr(e.target.value)} className="flex-1" />
        <Button onClick={onConnect} disabled={!addr.trim()}>Save</Button>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setShow(false)} className="w-full">
        Cancel
      </Button>
    </div>
  );
}
