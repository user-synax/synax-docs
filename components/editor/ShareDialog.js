"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
    X, 
    Link as LinkIcon, 
    UserPlus, 
    Copy, 
    Check, 
    Globe, 
    Lock,
    Shield,
    ShieldAlert,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const ShareDialog = ({ isOpen, onClose, documentId }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("share");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("viewer");
    const [collaborators, setCollaborators] = useState([]);
    const [owner, setOwner] = useState(null);
    const [shareSettings, setShareSettings] = useState({ shareMode: "private", shareToken: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchCollaborators = async () => {
        try {
            const res = await fetch(`/api/documents/${documentId}/collaborators`);
            if (res.ok) {
                const data = await res.json();
                setCollaborators(data.collaborators || []);
                setOwner(data.owner);
            }
        } catch (error) {
            console.error("Failed to fetch collaborators", error);
        }
    };

    const fetchShareSettings = async () => {
        try {
            const res = await fetch(`/api/documents/${documentId}/share`);
            if (res.ok) {
                const data = await res.json();
                setShareSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch share settings", error);
        }
    };

    useEffect(() => {
        if (isOpen && documentId) {
            fetchCollaborators();
            fetchShareSettings();
        }
    }, [isOpen, documentId]);


    const handleInvite = async () => {
        if (!inviteEmail) return;
        setIsInviting(true);
        try {
            const res = await fetch(`/api/documents/${documentId}/collaborators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            
            const data = await res.json();
            
            if (res.ok) {
                toast.success(`Invited ${inviteEmail}`);
                setInviteEmail("");
                fetchCollaborators();
            } else {
                toast.error(data.message || "Failed to invite user");
            }
        } catch (error) {
            toast.error("An error occurred while inviting");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveCollaborator = async (collabUserId) => {
        try {
            const res = await fetch(`/api/documents/${documentId}/collaborators`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: collabUserId }),
            });
            if (res.ok) {
                toast.success("Collaborator removed");
                fetchCollaborators();
            }
        } catch (error) {
            toast.error("Failed to remove collaborator");
        }
    };

    const handleUpdateRole = async (collabUserId, newRole) => {
        try {
            const res = await fetch(`/api/documents/${documentId}/collaborators`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: collabUserId, role: newRole }),
            });
            if (res.ok) {
                toast.success("Role updated");
                fetchCollaborators();
            }
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleUpdateShareMode = async (mode) => {
        try {
            const res = await fetch(`/api/documents/${documentId}/share`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shareMode: mode }),
            });
            if (res.ok) {
                setShareSettings(prev => ({ ...prev, shareMode: mode }));
                toast.success(`Share mode set to ${mode}`);
            }
        } catch (error) {
            toast.error("Failed to update share mode");
        }
    };

    const copyShareLink = () => {
        const link = `${window.location.origin}/share/${shareSettings.shareToken}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const isOwner = user?.id === owner?.clerkId;

    // TEMPORARY BYPASS: Check if it's owner OR if owner is not yet loaded
    const canManage = isOwner || !owner;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] h-[90vh] sm:h-auto max-h-[700px] bg-zinc-900 border-zinc-800 p-0 gap-0 overflow-hidden flex flex-col text-zinc-50">
                <DialogHeader className="p-4 sm:p-6 pb-0 shrink-0">
                    <DialogTitle className="text-lg sm:text-xl font-medium text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        Share document
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm">
                        Manage access and share links with others.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4 flex-1 flex flex-col overflow-hidden">
                    <TabsList className="w-full justify-start rounded-none border-b border-zinc-800 bg-transparent px-4 sm:px-6 h-auto p-0 shrink-0">
                        <TabsTrigger 
                            value="share" 
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 py-2 px-4 text-sm sm:text-base"
                        >
                            Share with people
                        </TabsTrigger>
                        <TabsTrigger 
                            value="link"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-400 py-2 px-4 text-sm sm:text-base"
                        >
                            Link sharing
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
                        <TabsContent value="share" className="m-0 space-y-6">
                            {/* Invite Section */}
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Invite collaborators</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input 
                                        placeholder="Enter email address" 
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="bg-zinc-800/50 border-zinc-800 text-white focus:ring-blue-400 flex-1"
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        <Select value={inviteRole} onValueChange={setInviteRole}>
                                            <SelectTrigger className="w-full sm:w-[110px] bg-zinc-800/50 border-zinc-800 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                                <SelectItem value="editor">Editor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            onClick={handleInvite} 
                                            disabled={!inviteEmail || isInviting}
                                            className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-full px-6 transition-all shrink-0"
                                        >
                                            Invite
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Collaborators List */}
                            <div className="space-y-4">
                                <Label className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Who has access</Label>
                                <div className="space-y-3">
                                    {/* Owner */}
                                    {owner && (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="w-8 h-8 border border-zinc-800 shrink-0">
                                                    <AvatarImage src={owner.avatarUrl} />
                                                    <AvatarFallback className="bg-zinc-800 text-white text-xs">
                                                        {owner.name?.charAt(0) || owner.email.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{owner.name || owner.email}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{owner.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-medium text-zinc-400 px-2 py-1 bg-zinc-800 rounded shrink-0">Owner</span>
                                        </div>
                                    )}

                                    {/* Others */}
                                    {collaborators.map((collab) => (
                                        <div key={collab.userId} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="w-8 h-8 border border-zinc-800 shrink-0">
                                                    <AvatarFallback className="bg-zinc-800 text-white text-xs">
                                                        {collab.email.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{collab.email}</p>
                                                    <p className="text-xs text-zinc-500 truncate capitalize">{collab.role}</p>
                                                </div>
                                            </div>
                                            
                                            {canManage && (
                                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                    <Select 
                                                        value={collab.role} 
                                                        onValueChange={(val) => handleUpdateRole(collab.userId, val)}
                                                    >
                                                        <SelectTrigger className="h-8 w-[80px] sm:w-[90px] bg-transparent border-none text-[11px] sm:text-xs text-zinc-400 hover:text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                            <SelectItem value="viewer">Viewer</SelectItem>
                                                            <SelectItem value="editor">Editor</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                                        onClick={() => handleRemoveCollaborator(collab.userId)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="link" className="m-0 space-y-6">
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 gap-4">
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {shareSettings.shareMode === 'private' ? (
                                            <Lock className="w-4 h-4 text-zinc-500" />
                                        ) : (
                                            <Globe className="w-4 h-4 text-blue-400" />
                                        )}
                                        <Label className="text-sm font-medium text-white truncate">Anyone with the link</Label>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                                        {shareSettings.shareMode === 'private' 
                                            ? "Only invited people can access" 
                                            : "Anyone with the link can access"}
                                    </p>
                                </div>
                                <Switch 
                                    checked={shareSettings.shareMode !== 'private'} 
                                    onCheckedChange={(checked) => handleUpdateShareMode(checked ? 'public-view' : 'private')}
                                    disabled={!canManage}
                                    className="shrink-0"
                                />
                            </div>

                            {shareSettings.shareMode !== 'private' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <RadioGroup 
                                        value={shareSettings.shareMode} 
                                        onValueChange={handleUpdateShareMode}
                                        disabled={!canManage}
                                        className="flex gap-4 sm:gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="public-view" id="public-view" className="border-zinc-700" />
                                            <Label htmlFor="public-view" className="text-xs sm:text-sm text-white cursor-pointer">Can view</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="public-edit" id="public-edit" className="border-zinc-700" />
                                            <Label htmlFor="public-edit" className="text-xs sm:text-sm text-white cursor-pointer">Can edit</Label>
                                        </div>
                                    </RadioGroup>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Share link</Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-zinc-800/50 border border-zinc-800 rounded-md px-3 py-2 text-xs sm:text-sm text-zinc-400 truncate">
                                                {window.location.origin}/share/{shareSettings.shareToken}
                                            </div>
                                            <Button 
                                                variant="secondary" 
                                                className="bg-zinc-800 text-white hover:bg-zinc-700 shrink-0"
                                                onClick={copyShareLink}
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-zinc-800">
                                <p className="text-[11px] sm:text-xs text-zinc-500 flex items-center gap-2">
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                    <span className="leading-tight">
                                        {shareSettings.shareMode === 'private' 
                                            ? "Only you and invited collaborators have access." 
                                            : shareSettings.shareMode === 'public-view'
                                                ? "Anyone with the link can view this document."
                                                : "Anyone with the link can edit this document."}
                                    </span>
                                </p>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default ShareDialog;
