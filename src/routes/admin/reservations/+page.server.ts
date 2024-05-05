import { serializeNonPOJOs } from '$lib/lib';
import { fail } from '@sveltejs/kit';

export const actions: import('./$types').Actions = {
	getMoreReservations: async({locals, request}) => {
        const data = await request.formData()
        const page = data.get("page")?.toString();
        if(!page) return fail(400);
        if(isNaN(parseInt(page))) return fail(400);
        const reservations = await locals.pb.collection("reservations").getList(parseInt(page), 50, { sort: 'created', expand: 'user,addons,category' });
        if(!reservations.items.length) return fail(404);
        return {
            reservations: serializeNonPOJOs(reservations)
        }
    },
    removeReservations: async({locals, request}) => {
        const formData = await request.formData();
        console.log(formData);
        const reason = formData.get("reason")?.toString();
        const checkboxes = formData.get("checkboxes")?.toString();

        const parsedCheckboxes = JSON.parse(checkboxes || "[]");
        if(!parsedCheckboxes.length || !reason) return fail(400);
        for(let i = 0; i < parsedCheckboxes.length; i++){
            await locals.pb.collection("reservations").delete(parsedCheckboxes[i]);
        };
        return {success: true};
    },
};

/** @type {import('./$types.d.ts').ServerLoad} */
export async function load({ locals }) {
	return {
		user: locals.user,
		reservations: await locals.pb
		.collection('reservations')
		.getList(0, 50, { sort: 'created', expand: 'user,addons,category' }),
		apiUrl: locals.pbApiURL
	};
}
