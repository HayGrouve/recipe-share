'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Copy, Mail, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  recipeId: string;
  recipeTitle?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  showText?: boolean;
}

export function ShareButton({
  recipeId,
  recipeTitle = '',
  size = 'default',
  variant = 'outline',
  className,
  showText = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const recipeUrl = `${window.location.origin}/recipes/${recipeId}`;
  const shareText = `Check out this recipe: ${recipeTitle}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Recipe: ${recipeTitle}`);
    const body = encodeURIComponent(`${shareText}\n\n${recipeUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`${shareText} ${recipeUrl}`);
    window.open(`sms:?body=${message}`, '_blank');
  };

  const shareViaWebShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: `Recipe: ${recipeTitle}`,
          text: shareText,
          url: recipeUrl,
        });
      } catch {
        // User cancelled sharing or sharing failed
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('gap-2', className)}
        >
          <Share2
            className={cn(
              'transition-colors',
              size === 'sm' && 'h-3 w-3',
              size === 'default' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5'
            )}
          />
          {showText && 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2">
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>

        {'share' in navigator && (
          <DropdownMenuItem onClick={shareViaWebShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share...
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={shareViaEmail} className="gap-2">
          <Mail className="h-4 w-4" />
          Share via email
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareViaSMS} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Share via SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
