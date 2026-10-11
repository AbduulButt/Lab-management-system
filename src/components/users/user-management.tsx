"use client";

import {
    KeyRound,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    UserCheck,
    UserRound,
    UserX,
    X,
} from "lucide-react";
import {
    useActionState,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";

import {
    createUserAction,
    resetUserPasswordAction,
    toggleUserStatusAction,
    updateUserAction,
    type UserActionState,
} from "@/actions/user-actions";

type UserRole =
    | "ADMIN"
    | "RECEPTIONIST"
    | "TECHNICIAN";

type UserRow = {
    id: string;
    fullName: string;
    username: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    isCurrentUser: boolean;
};

const initialState: UserActionState = {
    success: false,
    message: "",
};

function roleLabel(role: UserRole) {
    if (role === "ADMIN") {
        return "Administrator";
    }

    if (role === "TECHNICIAN") {
        return "Technician";
    }

    return "Receptionist";
}

function formatDate(
    value: string | null,
) {
    if (!value) {
        return "Never";
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(new Date(value));
}

export default function UserManagement({
    users,
}: {
    users: UserRow[];
}) {
    const [search, setSearch] =
        useState("");

    const [showCreate, setShowCreate] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState<UserRow | null>(null);

    const [
        passwordUser,
        setPasswordUser,
    ] = useState<UserRow | null>(null);

    const [message, setMessage] =
        useState<{
            success: boolean;
            text: string;
        } | null>(null);

    const [isPending, startTransition] =
        useTransition();

    const filteredUsers =
        useMemo(() => {
            const query = search
                .trim()
                .toLowerCase();

            if (!query) {
                return users;
            }

            return users.filter(
                (user) =>
                    user.fullName
                        .toLowerCase()
                        .includes(query) ||
                    user.username
                        .toLowerCase()
                        .includes(query) ||
                    roleLabel(user.role)
                        .toLowerCase()
                        .includes(query),
            );
        }, [users, search]);

    function toggleStatus(user: UserRow) {
        const action = user.isActive
            ? "deactivate"
            : "activate";

        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} ${user.fullName}?`,
            );

        if (!confirmed) {
            return;
        }

        startTransition(async () => {
            const result =
                await toggleUserStatusAction(
                    user.id,
                );

            setMessage({
                success: result.success,
                text: result.message,
            });
        });
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        User Management
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Create and manage Administrator,
                        Receptionist and Technician
                        accounts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowCreate(true)
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-md transition hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    Add User
                </button>
            </div>

            {message ? (
                <div
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.success
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    {message.text}
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value={users.length}
                    icon={
                        <UserRound className="h-6 w-6" />
                    }
                />

                <StatCard
                    title="Active Accounts"
                    value={
                        users.filter(
                            (user) => user.isActive,
                        ).length
                    }
                    icon={
                        <UserCheck className="h-6 w-6" />
                    }
                />

                <StatCard
                    title="Administrators"
                    value={
                        users.filter(
                            (user) =>
                                user.role === "ADMIN",
                        ).length
                    }
                    icon={
                        <ShieldCheck className="h-6 w-6" />
                    }
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            System Users
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {filteredUsers.length} account
                            {filteredUsers.length === 1
                                ? ""
                                : "s"}
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Search users..."
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <TableHeader>
                                    User
                                </TableHeader>

                                <TableHeader>
                                    Username
                                </TableHeader>

                                <TableHeader>
                                    Role
                                </TableHeader>

                                <TableHeader>
                                    Status
                                </TableHeader>

                                <TableHeader>
                                    Last Login
                                </TableHeader>

                                <TableHeader>
                                    Created
                                </TableHeader>

                                <TableHeader alignRight>
                                    Actions
                                </TableHeader>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map(
                                (user) => (
                                    <tr
                                        key={user.id}
                                        className="border-t border-slate-200 transition hover:bg-blue-50/50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                                    {user.fullName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {user.fullName}
                                                    </p>

                                                    {user.isCurrentUser ? (
                                                        <p className="mt-1 text-xs font-semibold text-blue-600">
                                                            Current account
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 font-medium text-slate-700">
                                            {user.username}
                                        </td>

                                        <td className="px-5 py-4">
                                            <RoleBadge
                                                role={user.role}
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${user.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {user.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatDate(
                                                user.lastLoginAt,
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatDate(
                                                user.createdAt,
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    title="Edit User"
                                                    onClick={() =>
                                                        setEditingUser(
                                                            user,
                                                        )
                                                    }
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Reset Password"
                                                    onClick={() =>
                                                        setPasswordUser(
                                                            user,
                                                        )
                                                    }
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100"
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isPending ||
                                                        user.isCurrentUser
                                                    }
                                                    title={
                                                        user.isCurrentUser
                                                            ? "You cannot deactivate your own account"
                                                            : user.isActive
                                                                ? "Deactivate"
                                                                : "Activate"
                                                    }
                                                    onClick={() =>
                                                        toggleStatus(user)
                                                    }
                                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${user.isActive
                                                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        }`}
                                                >
                                                    {user.isActive ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}

                            {filteredUsers.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-16 text-center text-slate-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreate ? (
                <CreateUserModal
                    onClose={() =>
                        setShowCreate(false)
                    }
                />
            ) : null}

            {editingUser ? (
                <EditUserModal
                    user={editingUser}
                    onClose={() =>
                        setEditingUser(null)
                    }
                    onMessage={setMessage}
                />
            ) : null}

            {passwordUser ? (
                <ResetPasswordModal
                    user={passwordUser}
                    onClose={() =>
                        setPasswordUser(null)
                    }
                    onMessage={setMessage}
                />
            ) : null}
        </section>
    );
}

/* ========================================================= */

function CreateUserModal({
    onClose,
}: {
    onClose: () => void;
}) {
    const [state, action, pending] =
        useActionState(
            createUserAction,
            initialState,
        );

    useEffect(() => {
        if (state.success) {
            const timer = window.setTimeout(
                () => {
                    onClose();
                },
                800,
            );

            return () =>
                window.clearTimeout(timer);
        }
    }, [state.success, onClose]);

    return (
        <Modal
            title="Add New User"
            onClose={onClose}
        >
            <form
                action={action}
                className="space-y-5"
            >
                {state.message ? (
                    <Message state={state} />
                ) : null}

                <UserFields />

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <CancelButton
                        onClick={onClose}
                    />

                    <button
                        disabled={pending}
                        className="h-11 rounded-lg bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {pending
                            ? "Creating..."
                            : "Create User"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function EditUserModal({
    user,
    onClose,
    onMessage,
}: {
    user: UserRow;
    onClose: () => void;
    onMessage: (
        message: {
            success: boolean;
            text: string;
        },
    ) => void;
}) {
    const [
        pending,
        startTransition,
    ] = useTransition();

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const formData =
            new FormData(
                event.currentTarget,
            );

        startTransition(async () => {
            const result =
                await updateUserAction(
                    user.id,
                    formData,
                );

            onMessage({
                success: result.success,
                text: result.message,
            });

            if (result.success) {
                onClose();
            }
        });
    }

    return (
        <Modal
            title="Edit User"
            onClose={onClose}
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <UserFields user={user} />

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <CancelButton
                        onClick={onClose}
                    />

                    <button
                        disabled={pending}
                        className="h-11 rounded-lg bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {pending
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function ResetPasswordModal({
    user,
    onClose,
    onMessage,
}: {
    user: UserRow;
    onClose: () => void;
    onMessage: (
        message: {
            success: boolean;
            text: string;
        },
    ) => void;
}) {
    const [password, setPassword] =
        useState("");

    const [
        pending,
        startTransition,
    ] = useTransition();

    function submit() {
        startTransition(async () => {
            const result =
                await resetUserPasswordAction(
                    user.id,
                    password,
                );

            onMessage({
                success: result.success,
                text: result.message,
            });

            if (result.success) {
                onClose();
            }
        });
    }

    return (
        <Modal
            title="Reset Password"
            onClose={onClose}
        >
            <div className="space-y-5">
                <div>
                    <p className="font-semibold text-slate-900">
                        {user.fullName}
                    </p>

                    <p className="text-sm text-slate-500">
                        @{user.username}
                    </p>
                </div>

                <label>
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                        New Password
                    </span>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value,
                            )
                        }
                        minLength={6}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <p className="text-xs text-slate-500">
                    Resetting the password logs
                    this user out of existing
                    sessions.
                </p>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                    <CancelButton
                        onClick={onClose}
                    />

                    <button
                        type="button"
                        disabled={
                            pending ||
                            password.length < 6
                        }
                        onClick={submit}
                        className="h-11 rounded-lg bg-amber-500 px-5 font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                        {pending
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function UserFields({
    user,
}: {
    user?: UserRow;
}) {
    return (
        <>
            <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                </span>

                <input
                    name="fullName"
                    required
                    defaultValue={
                        user?.fullName ?? ""
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
            </label>

            <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                </span>

                <input
                    name="username"
                    required
                    minLength={3}
                    defaultValue={
                        user?.username ?? ""
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
            </label>

            {!user ? (
                <label>
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Password
                    </span>

                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                </label>
            ) : null}

            <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Role
                </span>

                <select
                    name="role"
                    required
                    defaultValue={
                        user?.role ??
                        "RECEPTIONIST"
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                    <option value="ADMIN">
                        Administrator
                    </option>

                    <option value="RECEPTIONIST">
                        Receptionist
                    </option>

                    <option value="TECHNICIAN">
                        Technician
                    </option>
                </select>
            </label>
        </>
    );
}

function Modal({
    title,
    children,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    {icon}
                </div>

                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RoleBadge({
    role,
}: {
    role: UserRole;
}) {
    const styles = {
        ADMIN:
            "bg-violet-100 text-violet-700",
        RECEPTIONIST:
            "bg-blue-100 text-blue-700",
        TECHNICIAN:
            "bg-cyan-100 text-cyan-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[role]}`}
        >
            {roleLabel(role)}
        </span>
    );
}

function TableHeader({
    children,
    alignRight = false,
}: {
    children: React.ReactNode;
    alignRight?: boolean;
}) {
    return (
        <th
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-600 ${alignRight
                    ? "text-right"
                    : "text-left"
                }`}
        >
            {children}
        </th>
    );
}

function CancelButton({
    onClick,
}: {
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50"
        >
            Cancel
        </button>
    );
}

function Message({
    state,
}: {
    state: UserActionState;
}) {
    return (
        <div
            className={`rounded-lg border px-4 py-3 text-sm font-semibold ${state.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
        >
            {state.message}
        </div>
    );
}