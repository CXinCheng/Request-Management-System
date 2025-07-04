<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="400px"
  >
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="cancel">Cancel</v-btn>
        <span @click="confirm">
          <slot name="confirm" />
        </span>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: "Confirm Delete"
  },
  message: {
    type: String,
    default: "Are you sure you want to delete this item?"
  }
});
const emit = defineEmits(['update:modelValue']);

function cancel() {
  emit('update:modelValue', false);
}
function confirm() {
  emit('update:modelValue', false);
}
</script>
